import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateLearningPath } from '../services/pathService.js';

const prisma = new PrismaClient();

export const getPaths = async (req: Request, res: Response) => {
  try {
    const paths = await prisma.learningPath.findMany({
      include: {
        pathItems: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                category: true,
              },
            },
            chapter: {
              select: {
                id: true,
                title: true,
                order: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(paths);
  } catch (error) {
    console.error('Error fetching paths:', error);
    res.status(500).json({ error: 'Failed to fetch paths' });
  }
};

export const generatePath = async (req: Request, res: Response) => {
  try {
    const { interests, currentLevel } = req.body;

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({ error: 'Interests array is required' });
    }

    const path = await generateLearningPath(interests, currentLevel || 'BEGINNER');
    res.json(path);
  } catch (error) {
    console.error('Error generating path:', error);
    res.status(500).json({ error: 'Failed to generate learning path' });
  }
};

export const getPathById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const path = await prisma.learningPath.findUnique({
      where: { id },
      include: {
        pathItems: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                difficulty: true,
                estimatedHours: true,
              },
            },
            chapter: {
              select: {
                id: true,
                title: true,
                order: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!path) {
      return res.status(404).json({ error: 'Path not found' });
    }

    res.json(path);
  } catch (error) {
    console.error('Error fetching path:', error);
    res.status(500).json({ error: 'Failed to fetch path' });
  }
};
