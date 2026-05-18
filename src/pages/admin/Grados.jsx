import { useState, useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { useApiCall } from "../../hooks/useApiCall";
import { useFilters } from "../../hooks/useFilters";
import AdminTable from "../../components/AdminTable";
import FormModal from "../../components/FormModal";
import ConfirmModal from "../../components/ConfirmModal";
import FilterPanel from "../../components/FilterPanel";

export default function GradosPage() {
  const [grades, setGrades] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeToDelete, setGradeToDelete] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const { call: loadGrades, loading: loadingGrades } = useApiCall();
  const { call: saveGrade, loading: savingGrade } = useApiCall();
  const { call: deleteGrade, loading: deletingGrade } = useApiCall();

  const { filtered, setSearchTerm, filters, setFilters } = useFilters(
    grades,
    (item, filterObj) => {
      if (filterObj.estado !== undefined && filterObj.estado !== "") {
        if (item.estado !== (filterObj.estado === "true")) return false;
      }
      return true;
    }
  );

  const form = useForm(
    {
      numero_grado: "",
      grupo: "",
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
      const gradesData = await loadGrades("/grados", { method: "GET" });
      setGrades(gradesData?.data || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleSubmit(values) {
    try {
      if (editingGrade) {
        await saveGrade("/grados/" + editingGrade.id_grado, {
          method: "PUT",
          body: JSON.stringify(values),
        });
      } else {
        await saveGrade("/grados", {
          method: "POST",
          body: JSON.stringify(values),
        });
      }
      await loadInitialData();
      setShowModal(false);
      form.reset();
      setEditingGrade(null);
    } catch (error) {
      console.error("Error guardando grado:", error);
    }
  }

  function handleEditClick(grade) {
    setEditingGrade(grade);
    form.setValues(grade);
    setShowModal(true);
  }

  function handleDeleteClick(grade) {
    setGradeToDelete(grade);
    setShowDeleteModal(true);
  }

  async function handleConfirmDelete() {
    try {
      await deleteGrade("/grados/" + gradeToDelete.id_grado, {
        method: "DELETE",
      });
      await loadInitialData();
      setShowDeleteModal(false);
      setGradeToDelete(null);
    } catch (error) {
      console.error("Error eliminando grado:", error);
    }
  }

  function handleOpenModal() {
    setEditingGrade(null);
    form.reset();
    setShowModal(true);
  }

  const columns = [
    { key: "numero_grado", label: "Grado" },
    { key: "grupo", label: "Grupo" },
    {
      key: "estado",
      label: "Estado",
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === true ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {value === true ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Grados</h1>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
        >
          + Nuevo Grado
        </button>
      </div>

      <FilterPanel
        searchPlaceholder="Buscar por grado o grupo..."
        onSearch={setSearchTerm}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        filters={[
          {
            key: "estado",
            label: "Estado",
            type: "select",
            options: [
              { label: "Activo", value: "true" },
              { label: "Inactivo", value: "false" },
            ],
          },
        ]}
        loading={loadingGrades}
      />

      <AdminTable
        columns={columns}
        data={filtered}
        loading={loadingGrades || initialLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        itemsPerPage={10}
      />

      <FormModal
        isOpen={showModal}
        title={editingGrade ? "Editar Grado" : "Nuevo Grado"}
        onClose={() => {
          setShowModal(false);
          form.reset();
          setEditingGrade(null);
        }}
        onSubmit={form.handleSubmit}
        loading={savingGrade}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Grado *
            </label>
            <input
              type="number"
              name="numero_grado"
              value={form.values.numero_grado}
              onChange={form.handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grupo *
            </label>
            <input
              type="text"
              name="grupo"
              value={form.values.grupo}
              onChange={form.handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
        title="Eliminar Grado"
        message={`¿Estás seguro de que deseas eliminar el grado ${gradeToDelete?.numero_grado} - ${gradeToDelete?.grupo}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deletingGrade}
      />
    </div>
  );
}