import { useState, useEffect } from "react";
import { useForm } from "../../hooks/useForm";
import { useApiCall } from "../../hooks/useApiCall";
import { useFilters } from "../../hooks/useFilters";
import AdminTable from "../../components/AdminTable";
import FormModal from "../../components/FormModal";
import ConfirmModal from "../../components/ConfirmModal";
import FilterPanel from "../../components/FilterPanel";

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const { call: loadUsers, loading: loadingUsers } = useApiCall();
  const { call: loadRoles } = useApiCall();
  const { call: saveUser, loading: savingUser } = useApiCall();
  const { call: deleteUser, loading: deletingUser } = useApiCall();

  const { filtered, searchTerm, setSearchTerm, filters, setFilters } = useFilters(
    users,
    (item, filterObj) => {
      // ✅ rol_id es número
      if (filterObj.rol && item.rol_id !== Number(filterObj.rol)) return false;
      // ✅ estado es booleano
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
      correo: "",
      rol_id: "",
      estado: true,
      contraseña: "",
    },
    handleSubmit
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setInitialLoading(true);
      const [usersData, rolesData] = await Promise.all([
        loadUsers("/usuarios", { method: "GET" }),
        loadRoles("/roles", { method: "GET" }),
      ]);
      // Extraer arrays correctamente
      setUsers(usersData?.data || []);
      setRoles(rolesData?.data || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setInitialLoading(false);
    }
  }

  async function handleSubmit(values) {
    try {
      if (!editingUser && !values.contraseña) {
        alert("La contraseña es requerida para nuevos usuarios");
        return;
      }
      const dataToSave = { ...values };
      if (editingUser && !dataToSave.contraseña) {
        delete dataToSave.contraseña;
      }

      if (editingUser) {
        await saveUser(`/usuarios/${editingUser.id_usuario}`, {
          method: "PUT",
          body: JSON.stringify(dataToSave),
        });
      } else {
        await saveUser("/usuarios", {
          method: "POST",
          body: JSON.stringify(dataToSave),
        });
      }
      await loadInitialData();
      setShowModal(false);
      form.reset();
      setEditingUser(null);
    } catch (error) {
      console.error("Error guardando usuario:", error);
    }
  }

  function handleEditClick(user) {
    setEditingUser(user);
    form.setValues({ ...user, contraseña: "" });
    setShowModal(true);
  }

  function handleDeleteClick(user) {
    setUserToDelete(user);
    setShowDeleteModal(true);
  }

  async function handleConfirmDelete() {
    try {
      // ✅ Usar id_usuario
      await deleteUser(`/usuarios/${userToDelete.id_usuario}`, {
        method: "DELETE",
      });
      await loadInitialData();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error eliminando usuario:", error);
    }
  }

  function handleOpenModal() {
    setEditingUser(null);
    form.reset();
    setShowModal(true);
  }

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido1", label: "Primer Apellido" },
    { key: "apellido2", label: "Segundo Apellido" },
    { key: "correo", label: "Correo" },  
    {
      key: "estado",
      label: "Estado",
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === true
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}>
          {value === true ? "Activo" : "Inactivo"}  
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
        >
          + Nuevo Usuario
        </button>
      </div>

      <FilterPanel
        searchPlaceholder="Buscar por nombre o correo..."
        onSearch={setSearchTerm}
        onFilterChange={(key, value) => setFilters({ ...filters, [key]: value })}
        filters={[
          {
            key: "rol",
            label: "Rol",
            type: "select",
            // ✅ Cuando tengas los campos de roles, ajusta r.id_rol y r.nombre
            options: roles.map((r) => ({ label: r.nombre, value: r.id_rol })),
          },
          {
            key: "estado",
            label: "Estado",
            type: "select",
            options: [
              { label: "Activo", value: "true" },    // ✅ booleano como string
              { label: "Inactivo", value: "false" },
            ],
          },
        ]}
        loading={loadingUsers}
      />

      <AdminTable
        columns={columns}
        data={filtered}
        loading={loadingUsers || initialLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        itemsPerPage={10}
      />

      <FormModal
        isOpen={showModal}
        title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
        onClose={() => {
          setShowModal(false);
          form.reset();
          setEditingUser(null);
        }}
        onSubmit={form.handleSubmit}
        loading={savingUser}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo *</label>
            <input
              type="email"
              name="correo"
              value={form.values.correo}
              onChange={form.handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
            <select
              name="rol_id"
              value={form.values.rol_id}
              onChange={form.handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar rol</option>
              {roles.map((r) => (
                <option key={r.id_rol} value={r.id_rol}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña {editingUser ? "" : "*"}
            </label>
            <input
              type="password"
              name="contraseña"
              value={form.values.contraseña}
              onChange={form.handleChange}
              placeholder={editingUser ? "Dejar en blanco para no cambiar" : ""}
              required={!editingUser}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar a ${userToDelete?.nombre}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={deletingUser}
      />
    </div>
  );
}