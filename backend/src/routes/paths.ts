import { Router } from 'express';
import { getPaths, generatePath, getPathById } from '../controllers/pathController.js';

const router = Router();

router.get('/', getPaths);
router.post('/generate', generatePath);
router.get('/:id', getPathById);

export default router;
