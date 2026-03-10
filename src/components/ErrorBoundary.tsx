import type { PropsWithChildren } from "react";
import React from "react";

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<PropsWithChildren, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 p-8 text-[var(--color-text-primary)] bg-[var(--color-main-bg)]">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-md text-center">
            {this.state.error?.message}
          </p>
          <button
            type="button"
            className="px-4 py-2 text-sm rounded-md bg-[var(--color-accent)] text-white cursor-pointer hover:opacity-90"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
