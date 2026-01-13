import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pathApi } from '../services/api';
import type { LearningPath } from '@ai-learning/shared';
import { CourseCategory, Difficulty } from '@ai-learning/shared';

const categoryOptions: { value: CourseCategory; label: string }[] = [
  { value: CourseCategory.ML_BASICS, label: '机器学习基础' },
  { value: CourseCategory.DEEP_LEARNING, label: '深度学习' },
  { value: CourseCategory.NLP, label: '自然语言处理' },
  { value: CourseCategory.LLM, label: '大语言模型' },
  { value: CourseCategory.AI_TOOLS, label: 'AI工具' },
];

const difficultyOptions: { value: Difficulty; label: string }[] = [
  { value: Difficulty.BEGINNER, label: '初级' },
  { value: Difficulty.INTERMEDIATE, label: '中级' },
  { value: Difficulty.ADVANCED, label: '高级' },
];

export default function LearningPathPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState<CourseCategory[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>(Difficulty.BEGINNER);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadPaths();
  }, []);

  const loadPaths = async () => {
    try {
      setLoading(true);
      const response = await pathApi.getAll();
      setPaths(response.data);
    } catch (error) {
      console.error('Failed to load paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (category: CourseCategory) => {
    setSelectedInterests((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleGeneratePath = async () => {
    if (selectedInterests.length === 0) {
      alert('请至少选择一个兴趣领域');
      return;
    }

    try {
      setGenerating(true);
      const response = await pathApi.generate({
        interests: selectedInterests,
        currentLevel: selectedLevel,
      });
      await loadPaths(); // Reload paths to show the new one
      // Navigate to the new path
      window.location.href = `/paths/${response.data.id}`;
    } catch (error) {
      console.error('Failed to generate path:', error);
      alert('生成学习路径失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">学习路径</h1>

      {/* Generate Path Form */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">创建个性化学习路径</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              选择兴趣领域（可多选）
            </label>
            <div className="flex flex-wrap gap-3">
              {categoryOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInterestToggle(option.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedInterests.includes(option.value)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              当前水平
            </label>
            <div className="flex gap-3">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedLevel(option.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedLevel === option.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGeneratePath}
            disabled={generating || selectedInterests.length === 0}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? '生成中...' : '生成学习路径'}
          </button>
        </div>
      </div>

      {/* Existing Paths */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">已有学习路径</h2>
        
        {paths.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">暂无学习路径，请创建一个</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paths.map((path) => (
              <Link
                key={path.id}
                to={`/paths/${path.id}`}
                className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {path.name}
                </h3>
                <p className="text-gray-600 mb-4">{path.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>目标受众: {path.targetAudience}</span>
                  <span>{path.pathItems?.length || 0} 个学习项</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
