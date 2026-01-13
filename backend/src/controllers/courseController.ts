import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCourses = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const where = category ? { category: category as string } : {};
    
    const courses = await prisma.course.findMany({
      where,
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

export const getCourseChapters = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const chapters = await prisma.chapter.findMany({
      where: { courseId: id },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
};
