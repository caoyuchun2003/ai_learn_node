import { Router } from 'express';
import { getProgress, updateProgress } from '../controllers/progressController.js';

const router = Router();

router.get('/', getProgress);
router.post('/', updateProgress);

export default router;
