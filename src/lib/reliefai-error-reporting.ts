type ReliefAIErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type ReliefAIEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: ReliefAIErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __reliefAIEvents?: ReliefAIEvents;
    __reliefAIReportRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
    }) => void;
    __shubhamEvents?: ReliefAIEvents;
    __shubhamReportRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
    }) => void;
    __lovableEvents?: ReliefAIEvents;
    __lovableReportRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
    }) => void;
  }
}

export function reportReliefAIError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  (window.__reliefAIEvents ?? window.__shubhamEvents ?? window.__lovableEvents)?.captureException?.(
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
  (window.__reliefAIReportRuntimeError ?? window.__shubhamReportRuntimeError ?? window.__lovableReportRuntimeError)?.({
    message,
    ...(stack !== undefined && { stack }),
    filename: window.location.pathname,
  });
}

export const reportShubhamError = reportReliefAIError;
export const reportLovableError = reportReliefAIError;


