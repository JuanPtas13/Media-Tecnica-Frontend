import { useState, useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { useApiCall } from "../../hooks/useApiCall";
import AdminTable from "../../components/AdminTable";
import FormModal from "../../components/FormModal";
import ConfirmModal from "../../components/ConfirmModal";

export default function ConfiguracionPage() {
  const [configs, setConfigs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [configToDelete, setConfigToDelete] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const { call: loadConfigs, loading: loadingConfigs } = useApiCall();
  const { call: saveConfig, loading: savingConfig } = useApiCall();
  const { call: deleteConfig, loading: deletingConfig } = useApiCall();

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
      const configsData = await loadConfigs("/config-horarios/", {
        method: "GET",
      });
      // ✅ Extraer array correctamente
      setConfigs(configsData?.data || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleSubmit(values) {
    try {
      if (editingConfig) {
        await saveConfig("/config-horarios/" + editingConfig.id, {
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
      setEditingConfig(null);
    } catch (error) {
      console.error("Error guardando configuración:", error);
    }
  }

  function handleEditClick(config) {
    setEditingConfig(config);
    // ✅ Recortar segundos para inputs type="time"
    form.setValues({
      ...config,
      hora_inicio_clase: config.hora_inicio_clase?.slice(0, 5),
      hora_limite_ingreso: config.hora_limite_ingreso?.slice(0, 5),
    });
    setShowModal(true);
  }

  function handleDeleteClick(config) {
    setConfigToDelete(config);
    setShowDeleteModal(true);
  }

  async function handleConfirmDelete() {
    try {
      await deleteConfig("/config-horarios/" + configToDelete.id, {
        method: "DELETE",
      });
      await loadInitialData();
      setShowDeleteModal(false);
      setConfigToDelete(null);
    } catch (error) {
      console.error("Error eliminando configuración:", error);
    }
  }

  function handleOpenModal() {
    setEditingConfig(null);
    form.reset();
    setShowModal(true);
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString + "T00:00:00").toLocaleDateString("es-ES");
  };

  const columns = [
    {
      key: "hora_inicio_clase",
      label: "Hora de Entrada",
      render: (value) => value?.slice(0, 5),
    },
    {
      key: "hora_limite_ingreso",
      label: "Límite Ingreso",
      render: (value) => value?.slice(0, 5),
    },
    {
      key: "min_tolerancia",
      label: "Tolerancia (min)",
    },
    {
      key: "aplica_desde",
      label: "Vigente desde",
      render: (value) => formatDate(value),
    },
    {
      key: "aplica_hasta",
      label: "Vigente hasta",
      render: (value) => formatDate(value),
    },
    {
      key: "estado",
      label: "Estado",
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === true
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }`}>
          {value === true ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Configuración Horaria
        </h1>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
        >
          + Nueva Configuración
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 Aquí puedes definir los horarios de entrada y las tolerancias de
          minutos permitidos. Cada configuración tiene fechas de vigencia.
        </p>
      </div>

      <AdminTable
        columns={columns}
        data={configs}
        loading={loadingConfigs || initialLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        itemsPerPage={10}
      />

      <FormModal
        isOpen={showModal}
        title={editingConfig ? "Editar Configuración" : "Nueva Configuración"}
        onClose={() => {
          setShowModal(false);
          form.reset();
          setEditingConfig(null);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
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

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Eliminar Configuración"
        message="¿Estás seguro de que deseas eliminar esta configuración?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deletingConfig}
      />
    </div>
  );
}