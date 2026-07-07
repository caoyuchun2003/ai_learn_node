import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ChapterPage from './pages/ChapterPage';
import LearningPathPage from './pages/LearningPathPage';
import PathDetailPage from './pages/PathDetailPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <ErrorBoundary>
      <Router basename="/ai">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/chapters/:id" element={<ChapterPage />} />
            <Route path="/paths" element={<LearningPathPage />} />
            <Route path="/paths/:id" element={<PathDetailPage />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
