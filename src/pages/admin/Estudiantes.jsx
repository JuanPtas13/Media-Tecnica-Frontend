import { useState, useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { useApiCall } from "../../hooks/useApiCall";
import { useFilters } from "../../hooks/useFilters";
import AdminTable from "../../components/AdminTable";
import FormModal from "../../components/FormModal";
import ConfirmModal from "../../components/ConfirmModal";
import FilterPanel from "../../components/FilterPanel";

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

  const { filtered, setSearchTerm, filters, setFilters } = useFilters(
    students,
    (item, filterObj) => {
      if (filterObj.grado && item.grado_id !== Number(filterObj.grado)) return false;
      if (filterObj.estado !== undefined && filterObj.estado !== "") {
        if (item.estado !== (filterObj.estado === "true")) return false;
      }
      return true;
    }
  );

  const form = useForm(
    {
      nombre: "",
      apellido1: "",
      apellido2: "",
      documento: "",
      grado_id: "",
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
      const [studentsData, gradesData] = await Promise.all([
        loadStudents("/estudiantes", { method: "GET" }),
        loadGrades("/grados", { method: "GET" }),
      ]);
      setStudents(studentsData?.data?.estudiantes || []);
      setGrades(gradesData?.data || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleSubmit(values) {
    try {
      if (editingStudent) {
        await saveStudent(`/estudiantes/${editingStudent.id_estudiante}`, {
          method: "PUT",
          body: JSON.stringify(values),
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
    form.setValues({
      nombre: student.nombre,
      apellido1: student.apellido1,
      apellido2: student.apellido2,
      documento: student.documento,
      grado_id: student.grado_id,
      estado: student.estado,
    });
    setShowModal(true);
  }

  function handleDeleteClick(student) {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  }

  async function handleConfirmDelete() {
    try {
      await deleteStudent(`/estudiantes/${studentToDelete.id_estudiante}`, {
        method: "DELETE",
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
        >
          + Nuevo Estudiante
        </button>
      </div>

      <FilterPanel
        searchPlaceholder="Buscar por nombre, apellido o documento..."
        onSearch={setSearchTerm}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        filters={[
          {
            key: "grado",
            label: "Grado",
            type: "select",
            options: grades.map((g) => ({
              label: `${g.numero_grado} - ${g.grupo}`,
              value: g.id_grado,
            })),
          },
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
        loading={loadingStudents}
      />

      <AdminTable
        columns={columns}
        data={filtered}
        loading={loadingStudents || initialLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        itemsPerPage={10}
      />

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={form.values.nombre}
              onChange={form.handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primer Apellido *</label>
            <input
              type="text"
              name="apellido1"
              value={form.values.apellido1}
              onChange={form.handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Segundo Apellido</label>
            <input
              type="text"
              name="apellido2"
              value={form.values.apellido2}
              onChange={form.handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Documento *</label>
            <input
              type="text"
              name="documento"
              value={form.values.documento}
              onChange={form.handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grado *</label>
            <select
              name="grado_id"
              value={form.values.grado_id}
              onChange={form.handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar grado</option>
              {grades.map((g) => (
                <option key={g.id_grado} value={g.id_grado}>
                  {g.numero_grado} - {g.grupo}
                </option>
              ))}
            </select>
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

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Eliminar Estudiante"
        message={`¿Estás seguro de que deseas eliminar a ${studentToDelete?.nombre} ${studentToDelete?.apellido1}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deletingStudent}
      />
    </div>
  );
}