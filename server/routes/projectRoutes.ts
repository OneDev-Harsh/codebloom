import express from 'express'
import { protect } from '../middlewares/auth.js';
import { addComment, applyTemplate, componentsToHtml, deleteProject, getProjectById, getProjectComments, getProjectPreview, getPublishedProjects, htmlToComponents, makeRevision, rollbackToVersion, saveProjectCode } from '../controllers/projectController.js';

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

projectRouter.get('/:projectId/comments', getProjectComments)
projectRouter.post('/:projectId/comment', protect, addComment)

export default projectRouter
