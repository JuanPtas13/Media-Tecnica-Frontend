import { useState, useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { useApiCall } from "../../hooks/useApiCall";
import AdminTable from "../../components/AdminTable";
import FormModal from "../../components/FormModal";
import ConfirmModal from "../../components/ConfirmModal";
import { configuracionService } from "../../services/configuracionService";

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
      hora_entrada: "08:00",
      tolerancia_minutos: 5,
      fecha_inicio: "",
      fecha_fin: "",
    },
    handleSubmit
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setInitialLoading(true);
      const configsData = await loadConfigs("/configuracion-horaria", { 
        method: "GET" 
      });
      setConfigs(configsData || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleSubmit(values) {
    try {
      if (editingConfig) {
        await saveConfig("/configuracion-horaria/" + editingConfig.id, {
          method: "PUT",
          body: JSON.stringify(values),
        });
      } else {
        await saveConfig("/configuracion-horaria", {
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
    form.setValues(config);
    setShowModal(true);
  }

  function handleDeleteClick(config) {
    setConfigToDelete(config);
    setShowDeleteModal(true);
  }

  async function handleConfirmDelete() {
    try {
      await deleteConfig("/configuracion-horaria", {
        method: "DELETE",
        body: JSON.stringify({ config_id: configToDelete.id }),
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
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const columns = [
    {
      key: "hora_entrada",
      label: "Hora de Entrada",
    },
    {
      key: "tolerancia_minutos",
      label: "Tolerancia (min)",
    },
    {
      key: "fecha_inicio",
      label: "Vigente desde",
      render: (value) => formatDate(value),
    },
    {
      key: "fecha_fin",
      label: "Vigente hasta",
      render: (value) => formatDate(value),
    },
    {
      key: "estado",
      label: "Estado",
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === "vigente"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700"
        }`}>
          {value}
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

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 Aquí puedes definir los horarios de entrada y las tolerancias de minutos
          permitidos. Cada configuración tiene fechas de vigencia.
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
              Hora de Entrada *
            </label>
            <input
              type="time"
              name="hora_entrada"
              value={form.values.hora_entrada}
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
              name="tolerancia_minutos"
              value={form.values.tolerancia_minutos}
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
              name="fecha_inicio"
              value={form.values.fecha_inicio}
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
              name="fecha_fin"
              value={form.values.fecha_fin}
              onChange={form.handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Dejar en blanco si es vigente indefinidamente
            </p>
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
