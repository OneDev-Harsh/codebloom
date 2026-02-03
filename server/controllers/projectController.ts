import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import openai from '../configs/openai.js';
import { pageTemplates } from '../templates/pages/index.js';
import { parseHtmlToTree } from '../services/editor/htmlParser.js';
import { renderTreeToHtml } from '../services/editor/componentRenderer.js';

export const makeRevision = async (req: Request, res: Response) => {
    const userId = req.userId;
    try {

        const {projectId} = req.params
        const {message} = req.body

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if(!userId || !user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if(user.credits < 2){
            return res.status(403).json({ message: "You need to add more credits to make changes" });
        }
        
        if(!message || message.trim() === ''){
            return res.status(400).json({ message: "Please enter a valid prompt" });
        }

        const currentProject = await prisma.websiteProject.findUnique({
            where: {id: projectId, userId},
            include: {versions: true}
        })

        if(!currentProject){
            return res.status(404).json({ message: "Project not found" });
        }

        await prisma.conversation.create({
            data: {
                role: 'user',
                content: message,
                projectId,
            }
        }) 

        await prisma.user.update({
            where: {id: userId},
            data: {credits: {decrement: 2}}
        })

        const promptEnhanceResponse = await openai.chat.completions.create({
            model: 'xiaomi/mimo-v2-flash:free',
            messages: [
                {
                    role: 'system',
                    content: `
                    You are a senior product engineer writing a build specification for a production web application.

Transform the user request into a precise, implementation-ready specification that removes all ambiguity.

STRICT REQUIREMENTS:
- Explicitly list all required pages, sections, and UI components.
- Define layout structure, spacing scale, typography hierarchy, color system, and visual tone.
- Specify every interactive behavior, state, validation rule, and edge case.
- Define required JavaScript logic, data handling, and simulated backend behavior if needed.
- Require responsive behavior across mobile, tablet, and desktop.
- Require accessibility, keyboard navigation, semantic HTML, and focus visibility.
- Require loading, empty, success, error, and confirmation states where applicable.

RULES:
- Write in concise, directive sentences.
- Do not explain.
- Do not describe alternatives.
- Do not include meta commentary.
- Do not omit any implied requirement.

Output ONLY the final enhanced specification.
                    `
                },
                {
                    role: 'user',
                    content: `User's request: "${message}"`
                }
            ]
        })

        const enhancedPrompt = promptEnhanceResponse.choices[0].message.content

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `${enhancedPrompt}`,
                projectId,
            }
        })

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `Now making changes to the website...`,
                projectId,
            }
        })

        const codeGenerationResponse = await openai.chat.completions.create({
            model: 'mistralai/devstral-2512:free',
            messages: [
                {
                    role: 'system',
                    content: `
                    You are a senior front-end engineer modifying an existing production website.

Your task is to APPLY THE REQUESTED CHANGES to the provided HTML and return a FULLY UPDATED, COMPLETE, STANDALONE HTML FILE.

INPUT GUARANTEES:
- The provided HTML is the current production version.
- The provided specification describes the exact changes to apply.

MODIFICATION RULES:
- Preserve all existing functionality unless explicitly changed.
- Modify, add, or remove elements only as required by the specification.
- Maintain design consistency, spacing scale, typography, and color system.
- Improve UX and accessibility if necessary to support the requested change.

IMPLEMENTATION REQUIREMENTS:
- Use ONLY HTML, Tailwind CSS utilities, and vanilla JavaScript.
- Use Tailwind utility classes exclusively for all styling.
- Place ALL JavaScript inside a <script> tag immediately before </body>.
- Implement ALL new logic, states, validations, and edge cases required by the change.
- Ensure responsive behavior across mobile, tablet, and desktop.
- Ensure accessibility: semantic HTML, keyboard navigation, focus visibility, ARIA where needed.

HTML STRUCTURE REQUIREMENTS:
- Preserve required meta tags and Tailwind CDN usage.
- The output must be fully standalone and render correctly as-is.

SELF-VERIFICATION (REQUIRED BEFORE RESPONDING):
- The requested change is fully implemented.
- No existing feature is broken.
- No unused or dead code remains.
- All interactions function correctly.
- No partial implementations exist.

OUTPUT RULES (NON-NEGOTIABLE):
- Output ONLY the final, complete HTML.
- Do NOT include explanations, comments, markdown, or meta commentary.
- Do NOT describe what was changed — only apply it.

                    `
                },
                {
                    role: 'user',
                    content: `
                    CURRENT HTML:
                    ${currentProject.current_code}

                    REQUESTED CHANGE:
                    ${enhancedPrompt}
                    `
                }
            ]
        })

        const code = codeGenerationResponse.choices[0].message.content || '';

        if(!code){
            await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "There was an error while generating your code, please try again",
                projectId
            }
        })
        await prisma.user.update({
            where: {id: userId},
            data: {credits: {increment: 2}}
        })
        return
        }

        const version = await prisma.version.create({
            data: {
                code: code.replace(/```[a-z]*\n?/gi, '')
                .replace(/```$/g, '')
                .trim(),
                description: 'changes made',
                projectId
            }
        })

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "Changes have been made to your website!",
                projectId
            }
        })

        await prisma.websiteProject.update({
            where: {id: projectId},
            data: {
                current_code: code.replace(/```[a-z]*\n?/gi, '')
                .replace(/```$/g, '')
                .trim(),
                current_version_index: version.id
            }
        })

        res.json({message: "Changes made successfully"});
    } catch (error) {
        await prisma.user.update({
            where: {id: userId},
            data: {credits: {increment: 2}}
        })
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const rollbackToVersion = async (req: Request, res: Response) => {
    try {
        const userId = req.userId
        
        if(!userId){
            return res.status(401).json({message: 'Unauthorized'})
        }

        const {projectId, versionId} = req.params

        const project = await prisma.websiteProject.findUnique({
            where: {id: projectId, userId},
            include: {versions: true}
        })

        if(!project){
            return res.status(404).json({message: 'Project not found'})
        }

        const version = project.versions.find((version) => version.id === versionId)

        if(!version){
            return res.status(404).json({message: 'Version not found'})
        }

        await prisma.websiteProject.update({
            where: {id: projectId, userId},
            data: {
                current_code: version.code,
                current_version_index: version.id
            }
        })

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: 'Your website has been rolled back to the selected version.',
                projectId
            }
        })

        res.json({message: 'Version rolled back'})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId
        const {projectId} = req.params

        await prisma.websiteProject.delete({
            where: {id: projectId, userId},
        })

        res.json({message: 'Project deleted successfully'})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getProjectPreview = async (req: Request, res: Response) => {
    try {
        const userId = req.userId
        const {projectId} = req.params

        if(!userId){
            return res.status(401).json({message: 'Unauthorized'})
        }

        const project = await prisma.websiteProject.findFirst({
            where: {id: projectId, userId},
            include: {versions: true}
        })

        if(!project){
            return res.status(404).json({message: 'Project not found'})
        }

        res.json({project})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getPublishedProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.userId ?? null

    const projects = await prisma.websiteProject.findMany({
      where: { isPublished: true },
      include: {
        user: true,
        likes: {
          where: userId ? { userId } : undefined,
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedProjects = projects.map((project) => ({
      ...project,
      likedByMe: userId ? project.likes.length > 0 : false,
      likes: undefined, // remove raw relation from response
    }))

    res.json({ projects: formattedProjects })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Internal Server Error" })
  }
}



export const getProjectById = async (req: Request, res: Response) => {
    try {
        const {projectId} = req.params

        const project = await prisma.websiteProject.findFirst({
            where: {id: projectId},
        })

        if(!project || project.isPublished === false || !project?.current_code){
            return res.status(404).json({message: 'Project not found'})
        }

        res.json({code: project.current_code})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const saveProjectCode = async (req: Request, res: Response) => {
    try {
        const userId = req.userId
        const {projectId} = req.params

        const {code} = req.body

        if(!userId){
            return res.status(401).json({message: 'Unauthorized'})
        }

        if(!code){
            return res.status(401).json({message: 'Code is required'})
        }

        const project = await prisma.websiteProject.findUnique({
            where: {id: projectId, userId}
        })

        if(!project){
            res.status(404).json({message: 'Project not found'})
        }

        await prisma.websiteProject.update({
            where: {id: projectId},
            data: {current_code: code, current_version_index: ''} 
        })

        res.json({message: 'Project saved successfully'})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const applyTemplate = async (req: Request, res: Response) => {
  const { projectId, templateId } = req.body

  const template = pageTemplates.find(t => t.id === templateId)

  if (!template) {
    return res.status(404).json({ message: 'Template not found' })
  }

  await prisma.websiteProject.update({
    where: { id: projectId },
    data: {
      current_code: template.code
    }
  })

  await prisma.version.create({
    data: {
      projectId,
      code: template.code,
      description: `Applied template: ${template.name}`
    }
  })

  res.json({
    message: `Template "${template.name}" applied`
  })
}

export const htmlToComponents = async (req: Request, res: Response) => {
  try {
    const { html } = req.body

    if (!html || typeof html !== "string") {
      return res.status(400).json({ message: "HTML is required" })
    }

    const tree = parseHtmlToTree(html)

    return res.json({ tree })

  } catch (err) {
    console.error("HTML → components failed:", err)
    return res.status(500).json({ message: "Failed to convert HTML" })
  }
}

export const componentsToHtml = async (req: Request, res: Response) => {
  const { tree, originalHtml } = req.body

  if (!originalHtml || !originalHtml.includes("<html")) {
    return res.status(400).json({ message: "Invalid original HTML" })
  }

  // 1️⃣ Rebuild BODY from tree (deterministic)
  const rebuiltBody = renderTreeToHtml(tree)

  // 2️⃣ Preserve HEAD + BODY ATTRS
  const headMatch = originalHtml.match(/<head[\s\S]*?>[\s\S]*?<\/head>/i)
  const bodyAttrsMatch = originalHtml.match(/<body([^>]*)>/i)

  const head = headMatch ? headMatch[0] : "<head></head>"
  const bodyAttrs = bodyAttrsMatch ? bodyAttrsMatch[1] : ""

  const rebuiltHtml = `
<!DOCTYPE html>
<html lang="en">
  ${head}
  <body${bodyAttrs}>
    ${rebuiltBody}
  </body>
</html>
`.trim()

  // 3️⃣ AI STYLE TRANSFER (CONTROLLED)
  const aiResponse = await openai.chat.completions.create({
    model: "mistralai/devstral-2512:free",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
You are an HTML diff-and-transfer engine.

RULES (VERY IMPORTANT):
- DO NOT change structure
- DO NOT add or remove elements
- DO NOT rename or invent classes
- DO NOT modify text content
- ONLY copy class, style, and attributes
- Output ONLY valid HTML
        `,
      },
      {
        role: "user",
        content: `
ORIGINAL HTML (source of truth):
${originalHtml}

REBUILT HTML (structure updated):
${rebuiltHtml}

TASK:
Make the rebuilt HTML visually IDENTICAL to the original HTML
by transferring styles and attributes ONLY.
        `,
      },
    ],
  })

  const finalHtml =
    aiResponse.choices[0]?.message?.content?.trim() || rebuiltHtml

  // 4️⃣ Final safety check
  if (!finalHtml.includes("<html")) {
    return res.status(500).json({
      message: "AI returned invalid HTML",
    })
  }

  return res.json({ html: finalHtml })
}

export const getProjectComments = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params

    const comments = await prisma.projectComment.findMany({
      where: { projectId },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    res.json({ comments })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to fetch comments" })
  }
}

export const addComment = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    const { projectId } = req.params
    const { content } = req.body

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (!content?.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" })
    }

    const comment = await prisma.projectComment.create({
      data: {
        content,
        projectId,
        userId,
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    })

    res.json({ comment })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Failed to add comment" })
  }
}
