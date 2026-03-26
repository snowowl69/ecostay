import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          maxWidth: '600px',
          margin: '80px auto',
          background: '#fff0f0',
          borderRadius: '12px',
          border: '1px solid #fca5a5',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '12px' }}>Something went wrong</h2>
          <p style={{ color: '#7f1d1d', marginBottom: '16px' }}>
            {this.state.error?.message || 'Unknown error'}
          </p>
          <pre style={{
            background: '#1e293b',
            color: '#f1f5f9',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '0.8rem',
            maxHeight: '300px'
          }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
