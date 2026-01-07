import { fromNodeHeaders } from "better-auth/node"
import { auth } from "../lib/auth.js"
import { NextFunction, Request, Response } from "express"

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        })

        if(!session || !session.user) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        req.userId = session.user.id
        next()
    } catch (error) {
        console.error("Authentication error:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
} 