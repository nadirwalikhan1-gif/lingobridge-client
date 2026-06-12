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
    console.error('Admin page crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-lb-muted">
          <p className="font-medium text-lb-text mb-2">Something went wrong loading this page.</p>
          <p className="text-sm mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1.5 rounded-md bg-[#7F77DD] text-white text-sm"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}