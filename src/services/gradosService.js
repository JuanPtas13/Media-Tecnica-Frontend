import { apiCall } from "./api";

const ENDPOINT = "/grados";

export const gradosService = {
  // Listar todos los grados
  getAll: async (limit = 100) => {
    return apiCall(`${ENDPOINT}?limit=${limit}`, { method: "GET" });
  },

  // Obtener grados activos
  getActivos: async () => {
    return apiCall(`${ENDPOINT}/activos`, { method: "GET" });
  },

  // Filtrar por número
  getByNumero: async (numero) => {
    return apiCall(`${ENDPOINT}/numero/${numero}`, { method: "GET" });
  },

  // Crear grado
  create: async (data) => {
    return apiCall(ENDPOINT, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Actualizar grado
  update: async (grado_id, data) => {
    return apiCall(`${ENDPOINT}/${grado_id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Eliminar grado
  delete: async (grado_id) => {
    return apiCall(`${ENDPOINT}/${grado_id}`, { method: "DELETE" });
  },
};
