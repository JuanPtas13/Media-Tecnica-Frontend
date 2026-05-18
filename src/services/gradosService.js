import { apiCall } from "./api";

const ENDPOINT = "/grados";

export const gradosService = {
  // Listar todos los grados
  getAll: async () => {
    return apiCall(ENDPOINT, { method: "GET" });
  },

  // Obtener grados activos
  getActivos: async () => {
    return apiCall(`${ENDPOINT}/activos`, { method: "GET" });
  },

  // Filtrar por número
  getByNumero: async (numero) => {
    return apiCall(`${ENDPOINT}/numero?numero=${numero}`, {
      method: "GET",
    });
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
  delete: async (data) => {
    return apiCall(ENDPOINT, {
      method: "DELETE",
      body: JSON.stringify(data),
    });
  },
};
