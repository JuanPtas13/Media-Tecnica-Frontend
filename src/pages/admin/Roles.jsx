import { useState, useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { useApiCall } from "../../hooks/useApiCall";
import { useFilters } from "../../hooks/useFilters";
import AdminTable from "../../components/AdminTable";
import FormModal from "../../components/FormModal";
import ConfirmModal from "../../components/ConfirmModal";
import FilterPanel from "../../components/FilterPanel";

const AVAILABLE_PERMISSIONS = [
  "crear_estudiante", "editar_estudiante", "eliminar_estudiante",
  "crear_usuario", "editar_usuario", "eliminar_usuario",
  "crear_grado", "editar_grado", "eliminar_grado",
  "crear_rol", "editar_rol", "eliminar_rol",
  "ver_registros", "crear_registro", "editar_registro", "eliminar_registro",
  "configurar_horarios",
];

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const { call: loadRoles, loading: loadingRoles } = useApiCall();
  const { call: saveRole, loading: savingRole } = useApiCall();
  const { call: deleteRole, loading: deletingRole } = useApiCall();

  const { filtered, setSearchTerm } = useFilters(roles);

  const form = useForm(
    { nombre: "", descripcion: "", permisos: [] },
    handleSubmit
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setInitialLoading(true);
      const rolesData = await loadRoles("/roles", { method: "GET" });
      // ✅ Extraer array correctamente
      setRoles(rolesData?.data || []);
    } catch (error) {
      console.error("Error cargando roles:", error);
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleSubmit(values) {
    try {
      const dataToSave = { ...values, permisos: selectedPermissions };

      if (editingRole) {
        await saveRole("/roles/" + editingRole.id_roles, { // ✅ id_roles
          method: "PUT",
          body: JSON.stringify(dataToSave),
        });
      } else {
        await saveRole("/roles", {
          method: "POST",
          body: JSON.stringify(dataToSave),
        });
      }
      await loadInitialData();
      setShowModal(false);
      form.reset();
      setSelectedPermissions([]);
      setEditingRole(null);
    } catch (error) {
      console.error("Error guardando rol:", error);
    }
  }

  function handleEditClick(role) {
    setEditingRole(role);
    form.setValues(role);
    // ✅ permisos viene como string "all" o separado por comas, no array
    const perms = role.permisos === "all"
      ? [...AVAILABLE_PERMISSIONS]
      : (role.permisos || "").split(",").map(p => p.trim()).filter(Boolean);
    setSelectedPermissions(perms);
    setShowModal(true);
  }

  function handleDeleteClick(role) {
    setRoleToDelete(role);
    setShowDeleteModal(true);
  }

  async function handleConfirmDelete() {
    try {
      await deleteRole("/roles/" + roleToDelete.id_roles, { // ✅ id_roles
        method: "DELETE",
      });
      await loadInitialData();
      setShowDeleteModal(false);
      setRoleToDelete(null);
    } catch (error) {
      console.error("Error eliminando rol:", error);
    }
  }

  function handleOpenModal() {
    setEditingRole(null);
    form.reset();
    setSelectedPermissions([]);
    setShowModal(true);
  }

  const handlePermissionChange = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
    {
      key: "permisos",
      label: "Permisos",
      render: (value) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {value === "all"
            ? "Todos los permisos"
            : `${(value || "").split(",").filter(Boolean).length} permisos`}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Roles</h1>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
        >
          + Nuevo Rol
        </button>
      </div>

      <FilterPanel
        searchPlaceholder="Buscar por nombre..."
        onSearch={setSearchTerm}
        loading={loadingRoles}
      />

      <AdminTable
        columns={columns}
        data={filtered}
        loading={loadingRoles || initialLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        itemsPerPage={10}
      />

      <FormModal
        isOpen={showModal}
        title={editingRole ? "Editar Rol" : "Nuevo Rol"}
        onClose={() => {
          setShowModal(false);
          form.reset();
          setSelectedPermissions([]);
          setEditingRole(null);
        }}
        onSubmit={form.handleSubmit}
        loading={savingRole}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={form.values.descripcion}
              onChange={form.handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permisos
            </label>
            <div className="space-y-2">
              {AVAILABLE_PERMISSIONS.map((permission) => (
                <label key={permission} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => handlePermissionChange(permission)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {permission.replace(/_/g, " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </FormModal>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Eliminar Rol"
        message={`¿Estás seguro de que deseas eliminar el rol "${roleToDelete?.nombre}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deletingRole}
      />
    </div>
  );
}