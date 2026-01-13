// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: Difficulty;
  estimatedHours: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  order: number;
  content: string; // Markdown content
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  pathItems: PathItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PathItem {
  id: string;
  pathId: string;
  courseId: string;
  chapterId?: string;
  order: number;
  type: 'course' | 'chapter';
}

export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  chapterId?: string;
  completed: boolean;
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum CourseCategory {
  ML_BASICS = 'ML_BASICS',
  DEEP_LEARNING = 'DEEP_LEARNING',
  NLP = 'NLP',
  LLM = 'LLM',
  AI_TOOLS = 'AI_TOOLS'
}

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

// API Request/Response types
export interface GeneratePathRequest {
  interests: CourseCategory[];
  currentLevel: Difficulty;
}

export interface UpdateProgressRequest {
  courseId: string;
  chapterId?: string;
  completed: boolean;
}
