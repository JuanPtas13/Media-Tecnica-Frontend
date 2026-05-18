import { useState, useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { useApiCall } from "../../hooks/useApiCall";
import { useFilters } from "../../hooks/useFilters";
import AdminTable from "../../components/AdminTable";
import FormModal from "../../components/FormModal";
import ConfirmModal from "../../components/ConfirmModal";
import FilterPanel from "../../components/FilterPanel";
import { estudiantesService } from "../../services/estudiantesService";
import { gradosService } from "../../services/gradosService";

/**
 * Página de gestión de estudiantes
 */
export default function EstudiantesPage() {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const { call: loadStudents, loading: loadingStudents } = useApiCall();
  const { call: loadGrades } = useApiCall();
  const { call: saveStudent, loading: savingStudent } = useApiCall();
  const { call: deleteStudent, loading: deletingStudent } = useApiCall();

  const { filtered, searchTerm, setSearchTerm, filters, setFilters } = useFilters(
    students,
    (item, filterObj) => {
      if (filterObj.grado && item.grado !== filterObj.grado) return false;
      if (filterObj.estado && item.estado !== filterObj.estado) return false;
      return true;
    }
  );

  const form = useForm(
    {
      nombre: "",
      apellido: "",
      email: "",
      grado: "",
      estado: "activo",
    },
    handleSubmit
  );

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setInitialLoading(true);
      const [studentsData, gradesData] = await Promise.all([
        loadStudents("/estudiantes", { method: "GET" }),
        loadGrades("/grados", { method: "GET" }),
      ]);

      setStudents(studentsData?.data?.estudiantes || []);
      setGrades(gradesData?.data?.grados || gradesData?.data || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleSubmit(values) {
    try {
      if (editingStudent) {
        await saveStudent("/estudiantes", {
          method: "PUT",
          body: JSON.stringify({ ...values, id: editingStudent.id }),
        });
      } else {
        await saveStudent("/estudiantes", {
          method: "POST",
          body: JSON.stringify(values),
        });
      }
      await loadInitialData();
      setShowModal(false);
      form.reset();
      setEditingStudent(null);
    } catch (error) {
      console.error("Error guardando estudiante:", error);
    }
  }

  function handleEditClick(student) {
    setEditingStudent(student);
    form.setValues(student);
    setShowModal(true);
  }

  function handleDeleteClick(student) {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  }

  async function handleConfirmDelete() {
    try {
      await deleteStudent("/estudiantes", {
        method: "DELETE",
        body: JSON.stringify({ id: studentToDelete.id }),
      });
      await loadInitialData();
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error("Error eliminando estudiante:", error);
    }
  }

  function handleOpenModal() {
    setEditingStudent(null);
    form.reset();
    setShowModal(true);
  }

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido1", label: "Primer Apellido" },
    { key: "apellido2", label: "Segundo Apellido" },
    { key: "documento", label: "Documento" },
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
        >
          + Nuevo Estudiante
        </button>
      </div>

      {/* Filtros */}
      <FilterPanel
        searchPlaceholder="Buscar por nombre, apellido o email..."
        onSearch={setSearchTerm}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        filters={[
          {
            key: "grado",
            label: "Grado",
            type: "select",
            options: grades.map((g) => ({ label: g.nombre, value: g.nombre })),
          },
          {
            key: "estado",
            label: "Estado",
            type: "select",
            options: [
              { label: "Activo", value: "activo" },
              { label: "Inactivo", value: "inactivo" },
            ],
          },
        ]}
        loading={loadingStudents}
      />

      {/* Tabla */}
      <AdminTable
        columns={columns}
        data={filtered}
        loading={loadingStudents || initialLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        itemsPerPage={10}
      />

      {/* Form Modal */}
      <FormModal
        isOpen={showModal}
        title={editingStudent ? "Editar Estudiante" : "Nuevo Estudiante"}
        onClose={() => {
          setShowModal(false);
          form.reset();
          setEditingStudent(null);
        }}
        onSubmit={form.handleSubmit}
        loading={savingStudent}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              value={form.values.nombre}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido *
            </label>
            <input
              type="text"
              name="apellido"
              value={form.values.apellido}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.values.email}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grado *
            </label>
            <select
              name="grado"
              value={form.values.grado}
              onChange={form.handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar grado</option>
              {grades.map((g) => (
                <option key={g.id} value={g.nombre}>
                  {g.nombre}
                </option>
              ))}
            </select>
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
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Eliminar Estudiante"
        message={`¿Estás seguro de que deseas eliminar a ${studentToDelete?.nombre}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deletingStudent}
      />
    </div>
  );
}
