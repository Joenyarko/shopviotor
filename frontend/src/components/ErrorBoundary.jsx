import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if the error is a chunk load error (React Lazy load failed due to new deployment)
    const isChunkLoadError = 
      error?.message?.match(/Failed to fetch dynamically imported module/i) ||
      error?.message?.match(/Expected a JavaScript module script/i) ||
      error?.message?.match(/Importing a module script failed/i) ||
      error?.name === 'ChunkLoadError';

    if (isChunkLoadError) {
      // Set a flag in sessionStorage to prevent infinite reload loops just in case it's completely broken
      const reloadCount = parseInt(sessionStorage.getItem('chunk_reload_count') || '0', 10);
      
      if (reloadCount < 2) {
        sessionStorage.setItem('chunk_reload_count', (reloadCount + 1).toString());
        console.warn('Chunk load error detected! Forcing hard reload to get new deployment files...');
        // Force hard reload from server
        window.location.reload(true);
      } else {
        console.error('Too many reloads detected. Stopping to prevent infinite loop.');
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // If it's a chunk error, it will reload anyway, but we show a nice fallback just in case
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center dark:bg-secondary-950 dark:text-white">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">Updating to latest version...</h2>
          <p className="text-secondary-500 mb-6">If the page doesn't refresh automatically in a moment, please refresh your browser.</p>
          <button 
            onClick={() => {
              sessionStorage.removeItem('chunk_reload_count');
              window.location.reload(true);
            }} 
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2.5 px-6 rounded-xl transition-colors"
          >
            Refresh Now
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
