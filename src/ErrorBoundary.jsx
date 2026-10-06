import { Component } from 'react'

// Last line of defence: if a render throws, show a way back instead of a blank screen.
// Saved data lives in localStorage, so nothing is lost.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App crashed', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="gli-app">
        <div className="gli-view gli-welcome">
          <div className="gli-hero-title big">Something went wrong</div>
          <p className="gli-hint">
            The app hit an unexpected error. Your saved challenges and progress are safe on this device.
          </p>
          <pre className="gli-crash">{String(this.state.error?.message || this.state.error)}</pre>
          <button className="gli-btn primary block" onClick={() => window.location.reload()}>Reload the app</button>
        </div>
      </div>
    )
  }
}
