import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('App render error:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-full grid place-items-center p-6">
          <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <h1 className="font-bold text-lg mb-2">Terjadi kesalahan</h1>
            <p className="text-sm mb-3">Aplikasi mengalami error saat dirender.</p>
            <pre className="text-xs whitespace-pre-wrap bg-white/60 rounded-lg p-3 overflow-auto">
              {this.state.error.message}
            </pre>
            <button
              onClick={() => location.reload()}
              className="mt-4 rounded-xl bg-red-600 text-white px-4 py-2 text-sm"
            >
              Muat ulang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
