import { Router } from 'express';
import { getChapterById } from '../controllers/chapterController.js';

const router = Router();

router.get('/:id', getChapterById);

export default router;
