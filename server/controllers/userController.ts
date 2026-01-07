import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import openai from '../configs/openai.js';
import { role } from 'better-auth/plugins';
import  {razorpay } from "../lib/razorpay.js"
import { CREDIT_PLANS, type PlanId } from "../constants/creditPlans.js"
import crypto from "crypto"

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
            model: 'xiaomi/mimo-v2-flash:free',
            messages: [
                {
                    role: 'system',
                    content: `
                    You are an expert prompt enhancement specialist for high-end website generation. Your task is to transform a user’s brief, vague, or incomplete website idea into a precise, implementation-ready specification that enables an AI system or professional developer to build a fully functional, visually stunning, production-grade modern web application. The enhanced prompt must clearly define every required feature, workflow, and interaction of the application, ensuring that no core functionality is left ambiguous or partially implemented. The resulting website must be feature-complete, not a mockup or static demo.

                    Expand the request by explicitly specifying visual design and layout in detail, including overall structure (hero sections, feature grids, cards, dashboards, modals, navigation patterns, and footers), a cohesive color system (primary, secondary, accent, background, surface, and state colors), and typography choices (font families, hierarchy, spacing, and readability). Clearly define the visual tone (e.g., modern, premium, minimal, elegant, bold, futuristic) and require a beautiful, polished UI with attention to spacing, alignment, depth, shadows, gradients, and micro-details. Specify all core pages and sections such as landing pages, authentication flows, onboarding, dashboards, settings, content sections, forms, pricing, and support pages, along with all required integrations, data handling, and business logic. Every feature mentioned in the app concept must be fully implemented end-to-end, including proper state management, edge cases, and user feedback.

                    Describe the expected user experience and interactions in detail, including smooth animations, hover and focus states, transitions, loading indicators, skeletons, success/error feedback, empty states, confirmations, and validation messaging. Enforce modern best practices: fully responsive design across mobile, tablet, and desktop with adaptive layouts and touch-friendly interactions; accessibility compliance (WCAG-friendly contrast, semantic HTML, keyboard navigation, ARIA where needed); SEO-ready structure; performance optimization; and a clean, scalable, component-based architecture. Explicitly include privacy and security considerations, error handling, scalability, and maintainability. The output must be a concise but comprehensive 2–3 paragraph specification, written as a clear build-ready prompt, with no explanations, no meta commentary, and no omissions of functionality.
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
            model: "mistralai/devstral-2512:free",
            messages: [
                {
                    role: 'system',
                    content: `
                    You are an expert full-stack web developer and elite UI/UX engineer. Your task is to generate a complete, production-ready web application based strictly on the user’s request and the provided enhanced specification: "${enhancedPrompt}". The output must be fully functional, visually exceptional, and implementation-accurate, capable of serving as a real-world deployable product—not a mockup, demo, or partial implementation. You must intelligently determine the most appropriate output format (single-page HTML, multi-section HTML with JavaScript, or React components / app structure) based on the complexity and intent of the request, and implement every described feature end-to-end, including business logic, state handling, UI feedback, and edge cases.

                    GLOBAL IMPLEMENTATION STANDARDS (MANDATORY):
                    Use Tailwind CSS exclusively for all styling, ensuring a modern, premium aesthetic with excellent spacing, typography hierarchy, color harmony, gradients, shadows, and micro-interactions. The UI must feel beautiful, polished, and high-end, with smooth hover states, focus styles, transitions, animations, and loading indicators. The layout must be fully responsive across mobile, tablet, and desktop using Tailwind breakpoints (sm, md, lg, xl), with touch-friendly interactions on smaller devices. Follow accessibility best practices throughout: semantic HTML, proper contrast, keyboard navigation, focus visibility, and ARIA where appropriate. Include all essential UX states such as loading, empty, success, error, and confirmation states. When images are required, use placeholders from https://placehold.co/600x400
                    . You may implement realistic frontend API calls, mock data, async flows, and simulated backend interactions where needed to fully demonstrate functionality.

                    OUTPUT FORMAT RULES (STRICT):
                    If the output is HTML, return valid HTML only. Include the following script exactly inside the <head>:
                    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                    Include all required meta tags, use Google Fonts CDN if needed, and place all JavaScript inside a <script> tag before </body>.
                    If the output is React, return React code only (no explanations, no comments, no markdown). Use functional components, modern React patterns, hooks for state and effects, and Tailwind classes directly in JSX. Assume Tailwind is already configured unless explicitly stated otherwise. Components must be clean, reusable, scalable, and production-ready.

                    CRITICAL HARD RULES (NON-NEGOTIABLE):
                    Output only the requested code—nothing else.
                    Do not include explanations, comments, markdown, analysis, or meta commentary.
                    Do not leave any specified feature partially implemented or unhandled.
                    All functionality described in the prompt must be fully implemented, including UI, logic, interactions, and error handling.
                    The final output must be ready to run/render as-is, visually refined, and suitable for a real production environment.
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

export const toggleProjectLike = async (req: Request, res: Response) => {
  try {
    const userId = req.userId
    const { projectId } = req.params

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const existingLike = await prisma.projectLike.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    })

    if (existingLike) {
      await prisma.$transaction([
        prisma.projectLike.delete({
          where: { id: existingLike.id },
        }),
        prisma.websiteProject.update({
          where: { id: projectId },
          data: { likesCount: { decrement: 1 } },
        }),
      ])

      return res.json({ liked: false })
    }

    await prisma.$transaction([
      prisma.projectLike.create({
        data: { projectId, userId },
      }),
      prisma.websiteProject.update({
        where: { id: projectId },
        data: { likesCount: { increment: 1 } },
      }),
    ])

    return res.json({ liked: true })
  } catch (error) {
    console.error("LIKE ERROR:", error)
    return res.status(500).json({ message: "Failed to toggle like" })
  }
}

