import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getChapterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json(chapter);
  } catch (error) {
    console.error('Error fetching chapter:', error);
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
};
