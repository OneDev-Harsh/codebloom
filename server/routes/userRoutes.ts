import express from 'express';
import { protect } from '../middlewares/auth.js';
import { createUserProject, getUserCredits, getUserProject, getUserProjects, importHtmlProject, purchaseCredits, toggleProjectLike, togglePublish, verifyPayment } from '../controllers/userController.js';

const userRouter = express.Router()

userRouter.get('/credits', protect, getUserCredits)
userRouter.post('/project', protect, createUserProject)
userRouter.get('/project/:projectId', protect, getUserProject)
userRouter.post('/projects/:projectId/like', protect, toggleProjectLike)
userRouter.get('/projects', protect, getUserProjects)
userRouter.get('/publish-toggle/:projectId', protect, togglePublish)
userRouter.post('/purchase-credits', protect, purchaseCredits)
userRouter.post('/verify-payment', protect, verifyPayment)
userRouter.post('/project/import-html', protect, importHtmlProject)

export default userRouter;