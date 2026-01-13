import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pathApi } from '../services/api';
import type { LearningPath } from '@ai-learning/shared';

export default function PathDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPath();
    }
  }, [id]);

  const loadPath = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await pathApi.getById(id);
      setPath(response.data);
    } catch (error) {
      console.error('Failed to load path:', error);
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

  if (!path) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">学习路径不存在</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/paths"
        className="text-primary-600 hover:text-primary-700 text-sm mb-4 inline-block"
      >
        ← 返回学习路径
      </Link>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{path.name}</h1>
        <p className="text-lg text-gray-600 mb-4">{path.description}</p>
        <p className="text-sm text-gray-500">目标受众: {path.targetAudience}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">学习路径</h2>
        
        {!path.pathItems || path.pathItems.length === 0 ? (
          <p className="text-gray-500">路径为空</p>
        ) : (
          <div className="space-y-4">
            {path.pathItems.map((item, index) => (
              <div key={item.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1 border-l-2 border-primary-200 pl-4 pb-4 last:border-l-0">
                  {item.type === 'course' ? (
                    <Link
                      to={`/courses/${item.courseId}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500 uppercase">课程</span>
                          <h3 className="text-lg font-medium text-gray-900 mt-1">
                            {item.course?.title || '未知课程'}
                          </h3>
                          {item.course?.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.course.description}
                            </p>
                          )}
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
                  ) : (
                    <Link
                      to={`/chapters/${item.chapterId}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500 uppercase">章节</span>
                          <h3 className="text-lg font-medium text-gray-900 mt-1">
                            {item.chapter?.title || '未知章节'}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            来自: {item.course?.title || '未知课程'}
                          </p>
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
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
