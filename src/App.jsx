import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Auth from './pages/Auth';
import {
  DashboardSkeleton,
  CourseContentSkeleton,
  CourseTopicsSkeleton
} from './components/Loaders/Skeleton';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const CourseContent = lazy(() => import('./pages/CourseContent'));
const CourseTopics = lazy(() => import('./pages/CourseTopics'));
const CodePlayground = lazy(() => import('./pages/CodePlayground'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Suspense fallback={<DashboardSkeleton />}><Dashboard /></Suspense>} />
            <Route path="courses" element={<Suspense fallback={<CourseContentSkeleton />}><CourseContent /></Suspense>} />
            <Route path="course/:courseId" element={<Suspense fallback={<CourseTopicsSkeleton />}><CourseTopics /></Suspense>} />
            <Route path="playground" element={<Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-4rem)]"><div className="animate-spin w-8 h-8 border-2 border-dark-accent border-t-transparent rounded-full" /></div>}><CodePlayground /></Suspense>} />
            <Route path="leaderboard" element={<Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-4rem)]"><div className="animate-spin w-8 h-8 border-2 border-dark-accent border-t-transparent rounded-full" /></div>}><Leaderboard /></Suspense>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
