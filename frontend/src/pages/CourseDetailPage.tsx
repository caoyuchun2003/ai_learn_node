import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseApi } from '../services/api';
import type { Course, Chapter } from '@ai-learning/shared';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [courseResponse, chaptersResponse] = await Promise.all([
        courseApi.getById(id),
        courseApi.getChapters(id),
      ]);
      setCourse(courseResponse.data);
      setChapters(chaptersResponse.data);
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">课程不存在</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
        <p className="text-lg text-gray-600 mb-6">{course.description}</p>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>分类: {course.category}</span>
          <span>难度: {course.difficulty}</span>
          <span>预计时长: {course.estimatedHours} 小时</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">课程章节</h2>
        
        {chapters.length === 0 ? (
          <p className="text-gray-500">暂无章节</p>
        ) : (
          <div className="space-y-4">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/chapters/${chapter.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {chapter.order}. {chapter.title}
                    </h3>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
