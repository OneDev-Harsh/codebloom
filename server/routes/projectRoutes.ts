import express from 'express'
import { protect } from '../middlewares/auth.js';
import { addComment, applyTemplate, componentsToHtml, deleteComment, deleteProject, getProjectById, getProjectComments, getProjectPreview, getPublishedProjects, htmlToComponents, makeRevision, replyToComment, rollbackToVersion, saveProjectCode, toggleCommentLike } from '../controllers/projectController.js';

const projectRouter = express.Router();

projectRouter.post('/revision/:projectId', protect, makeRevision)
projectRouter.put('/save/:projectId', protect, saveProjectCode)
projectRouter.get('/rollback/:projectId/:versionId', protect, rollbackToVersion)
projectRouter.delete('/:projectId', protect, deleteProject)
projectRouter.get('/preview/:projectId', protect, getProjectPreview)
projectRouter.get('/published', getPublishedProjects)
projectRouter.get('/published/:projectId', getProjectById)

projectRouter.post('/apply-template', protect, applyTemplate)

projectRouter.post('/html-to-components', protect, htmlToComponents)
projectRouter.post('/components-to-html', protect, componentsToHtml)

projectRouter.get('/:projectId/comments', protect, getProjectComments)
projectRouter.post('/:projectId/comment', protect, addComment)

projectRouter.post('/comment/:commentId/like', protect, toggleCommentLike)
projectRouter.delete('/comment/:commentId', protect, deleteComment)
projectRouter.post('/comment/:commentId/reply', protect, replyToComment)

export default projectRouter
