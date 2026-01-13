import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { chapterApi, progressApi } from '../services/api';
import type { Chapter } from '@ai-learning/shared';
import 'highlight.js/styles/github-dark.css';

export default function ChapterPage() {
  const { id } = useParams<{ id: string }>();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      loadChapter();
    }
  }, [id]);

  const loadChapter = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await chapterApi.getById(id);
      setChapter(response.data);
      
      // Load progress
      if (response.data.courseId) {
        try {
          const progressResponse = await progressApi.getAll();
          const progress = progressResponse.data.find(
            p => p.chapterId === id && p.completed
          );
          setCompleted(!!progress);
        } catch (error) {
          // Ignore progress errors
        }
      }
    } catch (error) {
      console.error('Failed to load chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!chapter) return;
    
    try {
      await progressApi.update({
        courseId: chapter.courseId,
        chapterId: chapter.id,
        completed: !completed,
      });
      setCompleted(!completed);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">章节不存在</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link
          to={`/courses/${chapter.courseId}`}
          className="text-primary-600 hover:text-primary-700 text-sm mb-4 inline-block"
        >
          ← 返回课程
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">{chapter.title}</h1>
          <button
            onClick={handleMarkComplete}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              completed
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {completed ? '✓ 已完成' : '标记为完成'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {chapter.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
