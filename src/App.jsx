import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import CourseContent from './pages/CourseContent';
import CourseTopics from './pages/CourseTopics';
import CodePlayground from './pages/CodePlayground';
import { startKeepAlive, stopKeepAlive } from './services/api';

function App() {
  // Start keep-alive ping to prevent Render cold starts
  useEffect(() => {
    startKeepAlive();
    return () => stopKeepAlive();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="courses" element={<CourseContent />} />
          <Route path="course/:courseId" element={<CourseTopics />} />
          <Route path="playground" element={<CodePlayground />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;