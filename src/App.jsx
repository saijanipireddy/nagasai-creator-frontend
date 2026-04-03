import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';

// Lazy-load all pages to reduce initial bundle size
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CourseContent = lazy(() => import('./pages/CourseContent'));
const CourseTopics = lazy(() => import('./pages/CourseTopics'));
const CodePlayground = lazy(() => import('./pages/CodePlayground'));
const Jobs = lazy(() => import('./pages/Jobs'));
const JobDetail = lazy(() => import('./pages/JobDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Profile = lazy(() => import('./pages/Profile'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const ResumeCreator = lazy(() => import('./pages/ResumeCreator'));
const Announcements = lazy(() => import('./pages/Announcements'));

const PageSpinner = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Suspense fallback={<PageSpinner />}><Dashboard /></Suspense>} />
        <Route path="courses" element={<Suspense fallback={<PageSpinner />}><CourseContent /></Suspense>} />
        <Route path="course/:courseId" element={<Suspense fallback={<PageSpinner />}><CourseTopics /></Suspense>} />
        <Route path="playground" element={<Suspense fallback={<PageSpinner />}><CodePlayground /></Suspense>} />
        <Route path="jobs" element={<Suspense fallback={<PageSpinner />}><Jobs /></Suspense>} />
        <Route path="jobs/:jobId" element={<Suspense fallback={<PageSpinner />}><JobDetail /></Suspense>} />
        <Route path="leaderboard" element={<Suspense fallback={<PageSpinner />}><Leaderboard /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<PageSpinner />}><Profile /></Suspense>} />
        <Route path="resume-creator" element={<Suspense fallback={<PageSpinner />}><ResumeCreator /></Suspense>} />
        <Route path="announcements" element={<Suspense fallback={<PageSpinner />}><Announcements /></Suspense>} />
      </Route>
      <Route path="*" element={<Suspense fallback={<PageSpinner />}><NotFound /></Suspense>} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
