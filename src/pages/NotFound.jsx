import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-indigo-500 mb-2">404</h1>
        <h2 className="text-base font-semibold text-slate-900 mb-1">Page Not Found</h2>
        <p className="text-slate-500 text-sm mb-5">The page you're looking for doesn't exist.</p>
        <Link to="/" className="inline-flex px-5 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium text-sm">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
