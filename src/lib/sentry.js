// Sentry error tracking for frontend
// Setup: npm install @sentry/react && set VITE_SENTRY_DSN in .env
//
// Usage in main.jsx: import './lib/sentry';

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
  import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    });
  }).catch(() => {
    // @sentry/react not installed — skip
  });
}
