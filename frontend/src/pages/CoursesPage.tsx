import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { courseApi } from '../services/api';
import type { Course } from '@ai-learning/shared';
import { CourseCategory } from '@ai-learning/shared';

const categoryLabels: Record<CourseCategory, string> = {
  [CourseCategory.ML_BASICS]: '机器学习基础',
  [CourseCategory.DEEP_LEARNING]: '深度学习',
  [CourseCategory.NLP]: '自然语言处理',
  [CourseCategory.LLM]: '大语言模型',
  [CourseCategory.AI_TOOLS]: 'AI工具',
};

const difficultyLabels: Record<string, string> = {
  BEGINNER: '初级',
  INTERMEDIATE: '中级',
  ADVANCED: '高级',
};

const difficultyColors: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800',
  ADVANCED: 'bg-red-100 text-red-800',
};

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const category = searchParams.get('category') || '';

  useEffect(() => {
    loadCourses();
  }, [category]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getAll(category || undefined);
      console.log('Courses loaded:', response.data);
      setCourses(response.data);
    } catch (error: any) {
      console.error('Failed to load courses:', error);
      console.error('Error details:', error.response?.data || error.message);
      // 显示错误信息给用户
      alert('加载课程失败: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    if (newCategory) {
      setSearchParams({ category: newCategory });
    } else {
      setSearchParams({});
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">所有课程</h1>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            全部
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleCategoryChange(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                category === key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">暂无课程</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <span className="text-sm text-gray-500">
                  {categoryLabels[course.category as CourseCategory]}
                </span>
                <h2 className="text-xl font-semibold text-gray-900 mt-2 mb-2">
                  {course.title}
                </h2>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {course.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  difficultyColors[course.difficulty] || difficultyColors.BEGINNER
                }`}>
                  {difficultyLabels[course.difficulty] || course.difficulty}
                </span>
                <span className="text-sm text-gray-500">
                  {course.estimatedHours} 小时
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
