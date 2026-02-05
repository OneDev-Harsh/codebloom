import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import openai from '../configs/openai.js';
import { role } from 'better-auth/plugins';
import  {razorpay } from "../lib/razorpay.js"
import { CREDIT_PLANS, type PlanId } from "../constants/creditPlans.js"
import crypto from "crypto"
import { sanitizeHtml } from '../utils/sanitizeHtml.js';

export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        res.json({ credits: user?.credits});
    } catch (error) {
        console.error("Error fetching user credits:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const createUserProject = async (req: Request, res: Response) => {
    const userId = req.userId;
    try {
        const {initial_prompt} = req.body;
        if(!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if(user && user.credits <= 0) {
            return res.status(403).json({ message: "Insufficient credits. Add more credits to create a project." });
        }

        // create new project
        const project = await prisma.websiteProject.create({
            data: {
                name: initial_prompt.length > 50 ? initial_prompt.substring(0, 50)+"..." : initial_prompt,
                initial_prompt,
                userId,
            }
        })

        // update user's total creation
        await prisma.user.update({
            where: { id: userId },
            data: {totalCreation: {increment: 1}}
        })

        await prisma.conversation.create({
            data: {
                role: 'user',
                content: initial_prompt,
                projectId: project.id,
            }
        })

        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 5 } }
        })

        res.json({projectId: project.id});

        const promptEnhanceResponse = await openai.chat.completions.create({
            model: 'arcee-ai/trinity-large-preview:free:free',
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
                    `,
                },
                {
                    role: 'user',
                    content: initial_prompt,
                }
            ]
        })

        const enhancedPrompt = promptEnhanceResponse.choices[0].message?.content;

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `I have your prompt enhanced: ${enhancedPrompt}`,
                projectId: project.id,
            }
        });

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `now proceeding to create your website based on the enhanced prompt...`,
                projectId: project.id,
            }
        });

        const codeGenerationResponse = await openai.chat.completions.create({
            model: "arcee-ai/trinity-large-preview:free",
            messages: [
                {
                    role: 'system',
                    content: `
                    You are a senior front-end engineer and UI/UX specialist generating a production-ready web application.

Your task is to generate a COMPLETE, STANDALONE HTML FILE that fully implements the provided build specification.

MANDATORY TECHNOLOGY CONSTRAINTS:
- Use ONLY standard HTML, Tailwind CSS, and vanilla JavaScript.
- Use Tailwind utility classes exclusively for all styling.
- Do NOT use custom CSS files, inline styles, frameworks, or external JS libraries.

IMPLEMENTATION REQUIREMENTS:
- Implement EVERY feature, workflow, interaction, and edge case described in the specification.
- Implement ALL required JavaScript logic inside a <script> tag immediately before </body>.
- Simulate backend behavior using JavaScript where needed (mock data, async flows, persistence via localStorage).
- Implement loading, empty, success, error, validation, and confirmation states wherever applicable.
- Ensure full responsiveness across mobile, tablet, and desktop using Tailwind breakpoints (sm, md, lg, xl).
- Ensure accessibility using semantic HTML, keyboard navigation, focus visibility, and ARIA attributes where appropriate.
- Ensure visual polish: consistent spacing scale, typography hierarchy, color harmony, gradients, shadows, and smooth micro-interactions.
- When images are required, use placeholders from https://placehold.co/600x400.

HTML STRUCTURE REQUIREMENTS:
- Include all required meta tags.
- Include the following script EXACTLY inside <head>:
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
- Include Google Fonts via CDN if custom fonts are required.
- The HTML must render correctly as-is without modification.

SELF-VERIFICATION (REQUIRED BEFORE RESPONDING):
- Every button, form, and interaction works.
- No feature is missing or partially implemented.
- No user flow can reach a broken or undefined state.
- JavaScript has no syntax errors.
- The UI is usable and polished without further changes.

OUTPUT RULES (NON-NEGOTIABLE):
- Output ONLY the final, complete HTML.
- Do NOT include explanations, comments, markdown, or meta commentary.
- Do NOT include placeholders like TODO, FIXME, or NOTE.
                    `
                },
                {
                    role: 'user',
                    content: enhancedPrompt || ""
                }
            ]
        })

        const code = codeGenerationResponse.choices[0].message.content || "";

        if(!code){
            await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "There was an error while generating your code, please try again",
                projectId: project.id 
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
                description: 'Initial version',
                projectId: project.id
            }
        })

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "Your website has been created. You can now preview it and tell me if you want to make any changes.",
                projectId: project.id
            }
        })

        await prisma.websiteProject.update({
            where: {id: project.id},
            data: {
                current_code: code.replace(/```[a-z]*\n?/gi, '')
                .replace(/```$/g, '')
                .trim(),
                current_version_index: version.id
            }
        })

    } catch (error: any) {
        await prisma.user.update({
            where: {id: userId},
            data: {credits: {increment: 5}}
        })
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getUserProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const {projectId} = req.params

        const project = await prisma.websiteProject.findUnique({
            where: {id: projectId, userId},
            include: {
                conversation: {
                    orderBy: {timestamp: 'asc'}
                },
                versions: {orderBy: {timestamp: 'asc'}}
            }
        })

        res.json({project});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const projects = await prisma.websiteProject.findMany({
            where: {userId},
            orderBy: {updatedAt: 'desc'}
        })

        res.json({projects});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const togglePublish = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const {projectId} = req.params

        const project = await prisma.websiteProject.findUnique({
            where: {id: projectId, userId},
        })

        if(!project) {
            return res.status(404).json({message: 'Project not found'})
        }

        await prisma.websiteProject.update({
            where: {id: projectId, userId},
            data: {
                isPublished: !project.isPublished
            }
        })

        res.json({message: project.isPublished ? 'Project Unpublished' : 'Project Published'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const purchaseCredits = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string | undefined
    const { planId } = req.body as { planId?: PlanId }

    // 🔐 Auth check
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    // 🧠 Plan validation (runtime + TS-safe)
    if (!planId || !(planId in CREDIT_PLANS)) {
      return res.status(400).json({ message: "Invalid plan selected" })
    }

    const plan = CREDIT_PLANS[planId]

    // 1️⃣ Create pending transaction FIRST
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        planId,
        amount: plan.amount,
        credits: plan.credits,
        isPaid: false,
      },
    })

    // 2️⃣ Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(plan.amount * 100), // INR → paise
      currency: "INR",
      receipt: transaction.id, // IMPORTANT
      notes: {
        userId,
        planId,
        transactionId: transaction.id,
      },
    })

    // 3️⃣ Save orderId to transaction
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { orderId: order.id },
    })

    // 4️⃣ Send response to frontend
    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      credits: plan.credits,
      key: process.env.RAZORPAY_KEY_ID,
    })

  } catch (error) {
    console.error("Purchase credits error:", error)
    return res.status(500).json({
      message: "Failed to initiate payment",
    })
  }
}

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    // 1️⃣ Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" })
    }

    // 2️⃣ Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { orderId: razorpay_order_id },
    })

    if (!transaction || transaction.isPaid) {
      return res.status(400).json({ message: "Invalid transaction" })
    }

    // 3️⃣ Atomic update (VERY IMPORTANT)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          credits: { increment: transaction.credits },
        },
      }),
      prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          isPaid: true,
          paymentId: razorpay_payment_id,
        },
      }),
    ])

    return res.json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Payment verification failed" })
  }
}

// toggleProjectLike.ts
export const toggleProjectLike = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    const { projectId } = req.params

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const existingLike = await prisma.projectLike.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    })

    if (existingLike) {
      const [, project] = await prisma.$transaction([
        prisma.projectLike.delete({ where: { id: existingLike.id } }),
        prisma.websiteProject.update({
          where: { id: projectId },
          data: { likesCount: { decrement: 1 } },
        }),
      ])

      return res.json({ liked: false, likesCount: project.likesCount })
    }

    const [, project] = await prisma.$transaction([
      prisma.projectLike.create({ data: { projectId, userId } }),
      prisma.websiteProject.update({
        where: { id: projectId },
        data: { likesCount: { increment: 1 } },
      }),
    ])

    return res.json({ liked: true, likesCount: project.likesCount })
  } catch (error) {
    console.error("LIKE ERROR:", error)
    return res.status(500).json({ message: "Failed to toggle like" })
  }
}

export const importHtmlProject = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    const { html } = req.body

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    if (!html || typeof html !== "string") {
      return res.status(400).json({ message: "HTML is required" })
    }

    if (html.length > 100_000) {
      return res.status(400).json({ message: "HTML too large" })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    })

    if (!user || user.credits < 5) {
      return res.status(403).json({ message: "Insufficient credits" })
    }

    // 🔐 Sanitize
    const safeHtml = sanitizeHtml(html)

    // 🧱 Create project
    const project = await prisma.websiteProject.create({
      data: {
        userId,
        name: `Imported HTML • ${new Date().toLocaleDateString()}`,
        initial_prompt: "Imported HTML",
        current_code: safeHtml,
        //mode: "CLASSIC"
      }
    })

    // 🧾 Create first version
    await prisma.version.create({
      data: {
        projectId: project.id,
        code: safeHtml,
        //versionIndex: 0,
        description: "Initial imported HTML"
      }
    })

    // 💳 Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: 5 }
      }
    })

    return res.json({ projectId: project.id })

  } catch (error) {
    console.error("Import HTML error:", error)
    return res.status(500).json({ message: "Failed to import HTML" })
  }
}