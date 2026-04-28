import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
          <div className="relative w-full max-w-xl">
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-indigo-500/20 blur-3xl opacity-50" />
            
            <div className="relative bg-slate-900 border border-red-500/30 rounded-3xl p-8 md:p-12 shadow-2xl text-center overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertTriangle className="w-24 h-24 text-red-500" />
              </div>

              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>

              <h1 className="text-3xl font-black text-white mb-4 tracking-tight">
                DNA Sequence Mismatch
              </h1>
              
              <p className="text-slate-400 mb-8 leading-relaxed max-w-md mx-auto">
                Oops! A runtime error occurred while decoding the skill genome. The sequence has been interrupted by an unexpected exception.
              </p>

              {this.state.error && (
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mb-8 text-left overflow-auto max-h-32">
                  <code className="text-red-400 text-xs font-mono break-all">
                    {this.state.error.toString()}
                  </code>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
                >
                  <RefreshCcw className="w-4 h-4" /> Reset Helix
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-all border border-slate-700 flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" /> Terminal Home
                </button>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  Critical System Alert // EduGenome AI Core
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
