import { Link } from 'react-router-dom';
import { CourseCategory } from '@ai-learning/shared';

const categoryInfo = {
  [CourseCategory.ML_BASICS]: {
    name: '机器学习基础',
    description: '从零开始学习机器学习的基本概念和算法',
    color: 'bg-blue-500',
  },
  [CourseCategory.DEEP_LEARNING]: {
    name: '深度学习',
    description: '深入理解神经网络和深度学习技术',
    color: 'bg-purple-500',
  },
  [CourseCategory.NLP]: {
    name: '自然语言处理',
    description: '掌握文本处理和语言模型的核心技术',
    color: 'bg-green-500',
  },
  [CourseCategory.LLM]: {
    name: '大语言模型',
    description: '学习GPT、BERT等大语言模型的原理和应用',
    color: 'bg-orange-500',
  },
  [CourseCategory.AI_TOOLS]: {
    name: 'AI工具',
    description: '掌握LangChain、Hugging Face等实用AI工具',
    color: 'bg-pink-500',
  },
};

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          欢迎来到 AI 学习平台
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          面向开发者的AI知识学习平台，提供结构化的课程内容和智能学习路径推荐
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/courses"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            浏览课程
          </Link>
          <Link
            to="/paths"
            className="px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            创建学习路径
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          学习分类
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(categoryInfo).map(([category, info]) => (
            <Link
              key={category}
              to={`/courses?category=${category}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 ${info.color} rounded-lg mb-4 flex items-center justify-center`}>
                <span className="text-white font-bold text-xl">
                  {info.name[0]}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {info.name}
              </h3>
              <p className="text-gray-600">
                {info.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          平台特色
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              结构化课程
            </h3>
            <p className="text-gray-600">
              精心设计的课程体系，从基础到进阶，循序渐进
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              个性化路径
            </h3>
            <p className="text-gray-600">
              基于您的兴趣和水平，智能推荐最适合的学习路径
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              进度跟踪
            </h3>
            <p className="text-gray-600">
              实时记录学习进度，帮助您更好地规划学习
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
