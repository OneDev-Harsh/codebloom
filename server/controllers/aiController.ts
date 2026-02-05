import { Request, Response } from 'express';
import openai from '../configs/openai.js';
import { pageTemplates } from "../templates/pages/index.js"
import prisma from '../lib/prisma.js';

export const explainSection = async (req: Request, res: Response) => {
  try {
    const { tagName, className, text, styles } = req.body

    if (!tagName) {
      return res.status(400).json({ message: "Invalid element data" })
    }

    const explanationResponse = await openai.chat.completions.create({
      model: "arcee-ai/trinity-large-preview:free",
      messages: [
        {
          role: "system",
          content: `
            You are a friendly expert web developer and UI educator.

            Your job is to explain a website section in simple, non-technical language for beginners.

            Rules:
            - Do NOT mention HTML, CSS, Tailwind, React, or code syntax
            - Do NOT include implementation details
            - Explain WHAT the section does and WHY it exists
            - Mention what the user can safely edit (text, colors, spacing)
            - Mention what might break if removed
            - Keep the explanation short, clear, and helpful
            - Use plain English, not developer jargon
            `
        },
        {
        role: "user",
        content: `
            Explain this website section to a non-technical user:

            Section type: ${tagName}
            Displayed text: ${text || "No visible text"}
            Class name: ${className || "None"}
            Visual styles: ${JSON.stringify(styles, null, 2)}
            `
        }
      ],
      temperature: 0.4,
      max_tokens: 220,
    })

    const explanation =
      explanationResponse.choices[0]?.message?.content?.trim()

    return res.json({
      explanation: explanation || "This section helps structure and present content on your page."
    })
  } catch (error) {
    console.error("Explain section error:", error)
    return res.status(500).json({
      message: "Failed to explain section",
    })
  }
}

const SAFE_STYLE_KEYS = [
  "padding",
  "margin",
  "fontSize",
  "color",
  "backgroundColor",
  "lineHeight",
  "borderRadius"
]

function sanitizeSuggestions(
  suggestions: any[],
  originalStyles: Record<string, string>
) {
  if (!Array.isArray(suggestions)) return []

  return suggestions.map((s, index) => {
    const safeStyles: Record<string, string> = {}

    if (s?.changes?.styles) {
      for (const key of Object.keys(s.changes.styles)) {
        if (SAFE_STYLE_KEYS.includes(key)) {
          safeStyles[key] = s.changes.styles[key]
        }
      }
    }

    return {
      id: s.id || `suggestion-${index}`,
      label: s.label || "Suggestion",
      summary: s.summary || "",
      why: s.why || "",
      changes: {
        ...(s.changes?.text && { text: s.changes.text }),
        ...(Object.keys(safeStyles).length > 0 && {
          styles: safeStyles
        })
      }
    }
  })
}

export const suggestImprovements = async (req: Request, res: Response) => {
  try {
    const { tagName, text, styles, intent } = req.body

    if (!tagName || !styles) {
      return res.status(400).json({ message: "Invalid input" })
    }

    const aiResponse = await openai.chat.completions.create({
      model: "arcee-ai/trinity-large-preview:free",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `
        You are a senior UI/UX designer assisting a visual website editor.

        You do NOT redesign layouts.
        You do NOT add or remove elements.
        You ONLY suggest small, safe improvements to text and styles.

        Your job is to propose tasteful, realistic changes that a human designer would actually make.

        All outputs MUST be valid JSON.
        `
        },
        {
          role: "user",
          content: `
        Element context:
        - Semantic role: ${tagName}
        - Current text: ${text || "N/A"}
        - Current styles:
        ${JSON.stringify(styles, null, 2)}

        User intent:
        ${intent || "Improve visual clarity and polish"}

        Rules:
        - You may modify ONLY existing text and styles
        - Do NOT invent new CSS properties
        - Use realistic CSS values
        - Preserve original intent and meaning
        - All style values must be strings

        Task:
        Propose 2 DIFFERENT improvement options.

        Each option must include:
        - id (short string)
        - label (short human title)
        - summary (1 sentence)
        - why (1 sentence)
        - changes:
          {
            text?: string,
            styles?: { [key: string]: string }
          }

        Focus areas (pick what makes sense):
        - readability
        - contrast
        - spacing
        - hierarchy
        - accessibility

        Return JSON ONLY:
        {
          "suggestions": [...]
        }
        `
        }
      ]
    })

    const rawContent =
      aiResponse.choices[0]?.message?.content

    if (!rawContent) {
      throw new Error("Empty AI response")
    }

    const cleaned = rawContent
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

    const parsed = JSON.parse(cleaned)

    if (!Array.isArray(parsed.suggestions)) {
      throw new Error("Invalid AI response shape")
    }

    const sanitizedSuggestions = sanitizeSuggestions(parsed.suggestions, styles)

    return res.json({ suggestions: sanitizedSuggestions })

  } catch (error) {
    console.error("AI suggestion error:", error)
    return res.status(500).json({
      message: "Failed to generate suggestions"
    })
  }
}

export const improvePage = async (req: Request, res: Response) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ message: 'Page data required' })
    }

    const aiResponse = await openai.chat.completions.create({
      model: 'arcee-ai/trinity-large-preview:free',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: `
          You are a senior UI/UX and JavaScript expert in building HTML files capable of performing any function and accessibility consultant.

          Your job:
          - Analyze the entire webpage
          - Suggest improvements ONLY in natural language
          - Do NOT write code
          - Do NOT mention HTML, CSS, React, Tailwind, etc.

          Focus on:
          - Spacing consistency
          - Text clarity
          - Visual hierarchy
          - Accessibility
          - Overall polish

          Return a short, actionable list of suggestions.
          `
        },
        {
          role: 'user',
          content: `
          Here is the current webpage:
          
          ${code}
          `
        }
      ]
    })

    const suggestion =
      aiResponse.choices[0]?.message?.content?.trim()

    return res.json({
      suggestion:
        suggestion ||
        'Improve spacing, readability, and visual consistency across the page.'
    })
  } catch (error) {
    console.error('Improve page error:', error)
    res.status(500).json({ message: 'Failed to improve page' })
  }
}

export const applyTemplate = async (req: Request, res: Response) => {
  try {
    const { projectId, templateId } = req.body

    if (!projectId || !templateId) {
      return res.status(400).json({ message: "Missing projectId or templateId" })
    }

    // 1️⃣ Fetch project
    const project = await prisma.websiteProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        current_code: true,
        initial_prompt: true
      }
    })

    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    // 2️⃣ Find template
    const template = pageTemplates.find(t => t.id === templateId)

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    // 3️⃣ AI regeneration prompt
    const aiResponse = await openai.chat.completions.create({
      model: "arcee-ai/trinity-large-preview:free",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `
          You are a senior web designer and frontend engineer.

          Rules:
          - Use the provided template structure
          - Preserve the existing page intent and content
          - Improve layout consistency and spacing
          - Do NOT remove meaningful sections
          - Do NOT explain anything
          - Output ONLY valid HTML
          `
        },
        {
          role: "user",
          content: `
          Existing page HTML:
          <<<
          ${project.current_code}
          >>>

          Original user intent:
          "${project.initial_prompt}"

          Template structure to use:
          <<<
          ${template.code}
          >>>

          Task:
          Regenerate the page using the template while preserving content and intent.
          `
        }
      ]
    })

    const regeneratedCode = aiResponse.choices[0]?.message?.content?.trim()

    if (!regeneratedCode) {
      throw new Error("AI returned empty response")
    }

    // 4️⃣ Save new version (history-safe)
    await prisma.version.create({
      data: {
        projectId: project.id,
        code: regeneratedCode
      }
    })

    // 5️⃣ Update project pointer
    await prisma.websiteProject.update({
      where: { id: project.id },
      data: {
        current_code: regeneratedCode
      }
    })

    return res.json({
      message: "Template applied via AI regeneration",
      success: true
    })

  } catch (error) {
    console.error("Apply template error:", error)
    return res.status(500).json({
      message: "Failed to apply template"
    })
  }
}