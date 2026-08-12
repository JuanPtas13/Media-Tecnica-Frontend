import { useState, useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { useApiCall } from "../../hooks/useApiCall";
import FormModal from "../../components/FormModal";

/**
 * Página de configuración horaria del sistema.
 * Define los horarios de entrada, tolerancia y vigencia para la toma de asistencia.
 */
export default function ConfiguracionPage() {
  const [config, setConfig] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const { call: loadConfig, loading: loadingConfig } = useApiCall();
  const { call: saveConfig, loading: savingConfig } = useApiCall();

  const form = useForm(
    {
      hora_inicio_clase: "07:00",
      hora_limite_ingreso: "07:20",
      min_tolerancia: 20,
      aplica_desde: "",
      aplica_hasta: "",
      estado: true,
    },
    handleSubmit
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setInitialLoading(true);
      const data = await loadConfig("/config-horarios/vigente", { method: "GET" });
      setConfig(data?.data || null);
    } catch (error) {
      // Si no hay config vigente, config queda null
      setConfig(null);
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleSubmit(values) {
    try {
      if (config) {
        await saveConfig("/config-horarios/" + config.id, {
          method: "PUT",
          body: JSON.stringify(values),
        });
      } else {
        await saveConfig("/config-horarios/", {
          method: "POST",
          body: JSON.stringify(values),
        });
      }
      await loadInitialData();
      setShowModal(false);
      form.reset();
    } catch (error) {
      console.error("Error guardando configuración:", error);
    }
  }

  function handleEditClick() {
    form.setValues({
      ...config,
      hora_inicio_clase: config.hora_inicio_clase?.slice(0, 5),
      hora_limite_ingreso: config.hora_limite_ingreso?.slice(0, 5),
    });
    setShowModal(true);
  }

  function handleCrearClick() {
    form.reset();
    setShowModal(true);
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Indefinido";
    return new Date(dateString + "T00:00:00").toLocaleDateString("es-ES");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Configuración Horaria</h1>
        {!config && !initialLoading && (
          <button
            onClick={handleCrearClick}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
          >
            + Crear Configuración
          </button>
        )}
      </div>

      {/* Loading */}
      {initialLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Sin configuración */}
      {!initialLoading && !config && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-12 text-center space-y-4">
          <div className="text-6xl">⏰</div>
          <h2 className="text-xl font-bold text-yellow-800">Sin configuración vigente</h2>
          <p className="text-yellow-700">No hay ninguna configuración horaria activa.</p>
          <button
            onClick={handleCrearClick}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            + Crear Configuración
          </button>
        </div>
      )}

      {/* Tarjeta de configuración vigente */}
      {!initialLoading && config && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {/* Header de la tarjeta */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-bold">Configuración Vigente</h2>
              <p className="text-blue-100 text-sm mt-1">
                {formatDate(config.aplica_desde)} → {formatDate(config.aplica_hasta)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                config.estado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {config.estado ? "✅ Activa" : "❌ Inactiva"}
              </span>
              <button
                onClick={handleEditClick}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm transition-colors"
              >
                ✏️ Editar
              </button>
            </div>
          </div>

          {/* Contenido de la tarjeta */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🕐</span>
              </div>
              <p className="text-sm text-gray-500 font-medium">Hora de Inicio</p>
              <p className="text-4xl font-bold text-gray-900">
                {config.hora_inicio_clase?.slice(0, 5)}
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">⏰</span>
              </div>
              <p className="text-sm text-gray-500 font-medium">Límite de Ingreso</p>
              <p className="text-4xl font-bold text-gray-900">
                {config.hora_limite_ingreso?.slice(0, 5)}
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-sm text-gray-500 font-medium">Tolerancia</p>
              <p className="text-4xl font-bold text-gray-900">
                {config.min_tolerancia}
                <span className="text-lg text-gray-500 ml-1">min</span>
              </p>
            </div>
          </div>

          {/* Footer de la tarjeta */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Vigente desde <strong>{formatDate(config.aplica_desde)}</strong> hasta <strong>{formatDate(config.aplica_hasta)}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Modal editar/crear */}
      <FormModal
        isOpen={showModal}
        title={config ? "Editar Configuración" : "Nueva Configuración"}
        onClose={() => {
          setShowModal(false);
          form.reset();
        }}
        onSubmit={form.handleSubmit}
        loading={savingConfig}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora de Inicio de Clase *
            </label>
            <input
              type="time"
              name="hora_inicio_clase"
              value={form.values.hora_inicio_clase}
              onChange={form.handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora Límite de Ingreso *
            </label>
            <input
              type="time"
              name="hora_limite_ingreso"
              value={form.values.hora_limite_ingreso}
              onChange={form.handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tolerancia (minutos) *
            </label>
            <input
              type="number"
              name="min_tolerancia"
              value={form.values.min_tolerancia}
              onChange={form.handleChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vigente desde *
            </label>
            <input
              type="date"
              name="aplica_desde"
              value={form.values.aplica_desde}
              onChange={form.handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vigente hasta
            </label>
            <input
              type="date"
              name="aplica_hasta"
              value={form.values.aplica_hasta}
              onChange={form.handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Dejar en blanco si es vigente indefinidamente
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              name="estado"
              value={form.values.estado}
              onChange={form.handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={true}>Activo</option>
              <option value={false}>Inactivo</option>
            </select>
          </div>
        </div>
      </FormModal>
    </div>
  );
}