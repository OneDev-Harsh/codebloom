import express from "express"
import { protect } from "../middlewares/auth.js"
import { applyTemplate, explainSection, improvePage, suggestImprovements } from "../controllers/aiController.js"

const aiRouter = express.Router()

aiRouter.use((req, _res, next) => {
  console.log("AI ROUTE HIT:", req.method, req.path)
  next()
})

aiRouter.get("/ping", (_req, res) => {
  res.json({ ok: true });
});

aiRouter.post("/suggest-improvements", protect, suggestImprovements)
aiRouter.post("/explain-section", protect, explainSection)
aiRouter.post("/improve-page", protect, improvePage)
aiRouter.post("/apply-template", protect, applyTemplate)

export default aiRouter
