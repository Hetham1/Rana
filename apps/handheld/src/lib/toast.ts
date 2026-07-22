import { toast as sonnerToast, type ExternalToast } from "sonner";

/**
 * Keeps repeated failures from Strict Mode retries or concurrent loaders in one toast.
 * Sonner updates an existing toast when the same stable id is reused.
 */
function error(message: string, options: ExternalToast = {}) {
  const description = typeof options.description === "string" ? options.description : "";
  return sonnerToast.error(message, {
    ...options,
    id: options.id ?? `error:${message}:${description}`,
  });
}

export const toast = {
  error,
  info: sonnerToast.info,
  loading: sonnerToast.loading,
  promise: sonnerToast.promise,
  success: sonnerToast.success,
  warning: sonnerToast.warning,
};
