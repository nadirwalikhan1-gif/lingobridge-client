import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Global React Error Boundary.
 *
 * Wrap your app root (or per-page if you prefer granular isolation):
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * A runtime exception that would otherwise blank the whole page is caught here
 * and replaced with a graceful fallback UI.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Forward to your error-tracking service (Sentry, Datadog, etc.) here
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md w-full p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h2 className="text-[18px] font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
            An unexpected error occurred. Your session data is safe. Try going back to the home page.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="text-left text-[11px] bg-slate-50 border border-slate-200 rounded-xl p-3 mb-6 overflow-auto max-h-40 text-red-600">
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
