import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-extrabold text-dark-accent mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-dark-muted mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex px-6 py-3 bg-dark-accent text-white rounded-xl hover:bg-dark-accent/80 transition-colors font-semibold"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
