import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PayarMove UI caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#f7f8f8]">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-black/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.06)] text-center space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">View Temporarily Unavailable</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                We encountered an unexpected interface issue while rendering this view.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-gray-50/80 rounded-xl text-left border border-black/[0.04] max-h-28 overflow-auto shadow-2xs">
                <p className="text-[11px] font-mono text-gray-600 break-words">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-2 bg-[#06372d] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition shadow-sm"
              >
                <Home className="w-4 h-4" />
                <span>Return to Explore</span>
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 bg-white text-gray-700 border border-black/[0.06] px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-50 transition shadow-2xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
