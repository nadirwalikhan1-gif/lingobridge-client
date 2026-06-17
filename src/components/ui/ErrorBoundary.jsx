import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // TODO: forward to an error-tracking service (Sentry, Datadog, etc.)
    console.error('Uncaught render error:', error, info)
  }

  handleReset = () => {
    // Hard navigation rather than just clearing state — a render error usually
    // means something upstream is broken, so resetting local state alone can
    // re-trigger the same crash immediately.
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 text-lb-muted">
          <p className="font-medium text-lb-text mb-2">Something went wrong.</p>
          <p className="text-sm mb-4">Your data is safe — try going back to the home page.</p>
          {import.meta.env.DEV && this.state.error?.message && (
            <pre className="text-left text-xs bg-lb-card border border-lb-border rounded-lg p-3 mb-4 max-w-md overflow-auto text-red-600">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="px-3 py-1.5 rounded-md bg-[#7F77DD] text-white text-sm"
          >
            Go to homepage
          </button>
        </div>
      )
    }
    return this.props.children
  }
}