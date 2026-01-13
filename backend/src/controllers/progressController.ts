import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEFAULT_USER_ID = 'default';

export const getProgress = async (req: Request, res: Response) => {
  try {
    const { userId = DEFAULT_USER_ID } = req.query;
    
    const progress = await prisma.userProgress.findMany({
      where: { userId: userId as string },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
      orderBy: { lastAccessed: 'desc' },
    });

    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const { courseId, chapterId, completed } = req.body;
    const userId = DEFAULT_USER_ID;

    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    // 先尝试查找现有记录
    const existing = await prisma.userProgress.findFirst({
      where: {
        userId,
        courseId,
        chapterId: chapterId || null,
      },
    });

    let progress;
    if (existing) {
      // 更新现有记录
      progress = await prisma.userProgress.update({
        where: { id: existing.id },
        data: {
          completed: completed !== undefined ? completed : existing.completed,
          lastAccessed: new Date(),
        },
      });
    } else {
      // 创建新记录
      progress = await prisma.userProgress.create({
        data: {
          userId,
          courseId,
          chapterId: chapterId || null,
          completed: completed || false,
          lastAccessed: new Date(),
        },
      });
    }

    res.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
};
