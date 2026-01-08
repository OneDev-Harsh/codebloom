import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import openai from '../configs/openai.js';
import { pageTemplates } from '../templates/pages/index.js';

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
                    You are an **elite prompt enhancement specialist for production website and web-app modifications**. Transform the user’s high-level or vague change request into a **clear, implementation-ready instruction** by explicitly identifying **which components, sections, pages, or files must be updated**, detailing all **required visual changes** (specific colors or gradients, spacing and sizing scale, typography hierarchy, font weights, borders, shadows, layout structure, and responsive behavior across breakpoints), and defining any **functional or interaction updates** (state management, animations, transitions, event handling, form validation, API calls) using precise technical language. Clearly articulate the **intended visual, usability, and UX outcome** so success criteria are unambiguous, and return **only the enhanced request**, using **as many concise, actionable sentences as needed to fully capture the requirements**, with no explanations, commentary, or extra text.
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
                content: `Your enhanced prompt is: "${enhancedPrompt}"`,
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
                    You are an expert web developer and UI engineer responsible for modifying an existing website. Implement any user-requested change with absolute precision by returning ONLY a fully updated, complete, production-ready HTML document that reflects all requested visual, structural, and functional updates, using Tailwind CSS utilities exclusively for all styling (no custom CSS, inline styles, or external stylesheets), preserving and improving design consistency, responsiveness across all breakpoints, accessibility, and modern UX quality; place all JavaScript inside <script> tags immediately before </body>, ensure the file is fully standalone and renders correctly on its own, and do not include explanations, comments, markdown, or extra text—only the final HTML output.
                    `
                },
                {
                    role: 'user',
                    content: `Your current website code: "${currentProject.current_code}" The user wants this change: "${enhancedPrompt}`
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
    const userId = req.userId || null

    const projects = await prisma.websiteProject.findMany({
      where: { isPublished: true },
      include: {
        user: true,
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedProjects = projects.map((project) => ({
      ...project,
      likedByMe: userId ? project.likes.length > 0 : false,
      likes: undefined, // clean response
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