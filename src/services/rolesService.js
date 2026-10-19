import { apiCall } from "./api";

const ENDPOINT = "/roles";

export const rolesService = {
  // Listar todos los roles
  getAll: async () => {
    return apiCall(ENDPOINT, { method: "GET" });
  },

  // Buscar roles
  search: async (query) => {
    return apiCall(`${ENDPOINT}/buscar?query=${encodeURIComponent(query)}`, {
      method: "GET",
    });
  },

  // Filtrar por nombre
  getByNombre: async (nombre) => {
    return apiCall(`${ENDPOINT}/nombre/${encodeURIComponent(nombre)}`, {
      method: "GET",
    });
  },
};
