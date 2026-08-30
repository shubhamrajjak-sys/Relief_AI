type ShubhamErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type ShubhamEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: ShubhamErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __shubhamEvents?: ShubhamEvents;
    __shubhamReportRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
    }) => void;
    __lovableEvents?: ShubhamEvents;
    __lovableReportRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
    }) => void;
  }
}

export function reportShubhamError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  (window.__shubhamEvents ?? window.__lovableEvents)?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );

  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  (window.__shubhamReportRuntimeError ?? window.__lovableReportRuntimeError)?.({
    message,
    ...(stack !== undefined && { stack }),
    filename: window.location.pathname,
  });
}

export const reportLovableError = reportShubhamError;

