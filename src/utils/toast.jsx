import { useState, useCallback, useRef } from "react";

/**
 * Toast/Notification Context y Hook
 * Uso:
 * const { showToast } = useToast();
 * showToast("Mensaje", "success");
 */

let toastQueue = [];
let listeners = [];

function notifyListeners() {
  listeners.forEach((listener) => listener([...toastQueue]));
}

export function showToast(message, type = "info", duration = 3000) {
  const id = Date.now();
  const toast = { id, message, type };

  toastQueue.push(toast);
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      toastQueue = toastQueue.filter((t) => t.id !== id);
      notifyListeners();
    }, duration);
  }

  return id;
}

export function useToast() {
  const [toasts, setToasts] = useState([...toastQueue]);
  const listenerRef = useRef(null);

  // Registrar listener
  if (!listenerRef.current) {
    listenerRef.current = (newToasts) => setToasts(newToasts);
    listeners.push(listenerRef.current);
  }

  const removeToast = useCallback((id) => {
    toastQueue = toastQueue.filter((t) => t.id !== id);
    notifyListeners();
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    showSuccess: (msg, duration) => showToast(msg, "success", duration),
    showError: (msg, duration) => showToast(msg, "error", duration),
    showWarning: (msg, duration) => showToast(msg, "warning", duration),
    showInfo: (msg, duration) => showToast(msg, "info", duration),
  };
}

/**
 * Componente Toast Container
 * Renderizar una vez en App.jsx
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getStyles = (type) => {
    const styles = {
      success: "bg-green-500 text-white",
      error: "bg-red-500 text-white",
      warning: "bg-yellow-500 text-white",
      info: "bg-blue-500 text-white",
    };
    return styles[type] || styles.info;
  };

  const getIcon = (type) => {
    const icons = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ",
    };
    return icons[type] || icons.info;
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getStyles(toast.type)} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-in`}
        >
          <span className="text-lg font-bold">{getIcon(toast.type)}</span>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-lg hover:opacity-75 transition"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
