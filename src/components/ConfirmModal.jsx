/**
 * Modal de confirmación para acciones destructivas
 * Usualmente para eliminar registros
 */
export default function ConfirmModal({
  isOpen,
  title = "Confirmar acción",
  message = "¿Estás seguro?",
  onConfirm,
  onCancel,
  loading = false,
  variant = "danger",
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      button: "bg-red-600 hover:bg-red-700",
      icon: "text-red-600",
      bg: "bg-red-50",
    },
    warning: {
      button: "bg-yellow-600 hover:bg-yellow-700",
      icon: "text-yellow-600",
      bg: "bg-yellow-50",
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        {/* Icon and Message */}
        <div className={`${style.bg} px-6 py-8 text-center`}>
          {variant === "danger" && (
            <svg
              className={`w-12 h-12 ${style.icon} mx-auto mb-4`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0-6a4 4 0 110 8 4 4 0 010-8zM8 4a8 8 0 1116 0M8 4a8 8 0 1116 0"
              />
            </svg>
          )}
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${style.button}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Eliminando...
              </span>
            ) : (
              "Eliminar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
