import axios from 'axios';
import type { Course, Chapter, LearningPath, UserProgress, GeneratePathRequest } from '@ai-learning/shared';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器用于调试
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器用于调试
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const courseApi = {
  getAll: (category?: string) => 
    api.get<Course[]>('/courses', { params: { category } }),
  
  getById: (id: string) => 
    api.get<Course>(`/courses/${id}`),
  
  getChapters: (courseId: string) => 
    api.get<Chapter[]>(`/courses/${courseId}/chapters`),
};

export const chapterApi = {
  getById: (id: string) => 
    api.get<Chapter>(`/chapters/${id}`),
};

export const pathApi = {
  getAll: () => 
    api.get<LearningPath[]>('/paths'),
  
  generate: (data: GeneratePathRequest) => 
    api.post<LearningPath>('/paths/generate', data),
  
  getById: (id: string) => 
    api.get<LearningPath>(`/paths/${id}`),
};

export const progressApi = {
  getAll: (userId?: string) => 
    api.get<UserProgress[]>('/progress', { params: { userId } }),
  
  update: (data: { courseId: string; chapterId?: string; completed: boolean }) => 
    api.post<UserProgress>('/progress', data),
};

export default api;
