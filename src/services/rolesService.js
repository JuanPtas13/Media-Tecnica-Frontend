import { apiCall } from "./api";

const ENDPOINT = "/roles";

export const rolesService = {
  // Listar todos los roles
  getAll: async () => {
    return apiCall(ENDPOINT, { method: "GET" });
  },

  // Buscar roles
  search: async (query) => {
    return apiCall(`${ENDPOINT}/buscar?q=${encodeURIComponent(query)}`, {
      method: "GET",
    });
  },

  // Filtrar por nombre
  getByNombre: async (nombre) => {
    return apiCall(`${ENDPOINT}/nombre?nombre=${encodeURIComponent(nombre)}`, {
      method: "GET",
    });
  },

  // Crear rol
  create: async (data) => {
    return apiCall(ENDPOINT, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Actualizar rol
  update: async (rol_id, data) => {
    return apiCall(`${ENDPOINT}/${rol_id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Eliminar rol
  delete: async (data) => {
    return apiCall(ENDPOINT, {
      method: "DELETE",
      body: JSON.stringify(data),
    });
  },
};
