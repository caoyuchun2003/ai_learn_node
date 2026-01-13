import { Router } from 'express';
import { getCourses, getCourseById, getCourseChapters } from '../controllers/courseController.js';

const router = Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.get('/:id/chapters', getCourseChapters);

export default router;
