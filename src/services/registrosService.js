import { apiCall } from "./api";

const ENDPOINT = "/registros";

export const registrosService = {
  // Listar todos los registros
  getAll: async (limit = 100) => {
    return apiCall(`${ENDPOINT}?limit=${limit}`, { method: "GET" });
  },

  // Obtener últimos registros
  getUltimos: async () => {
    return apiCall(`${ENDPOINT}/ultimos`, { method: "GET" });
  },

  // Filtrar por estudiante
  getByEstudiante: async (estudiante_id) => {
    return apiCall(`${ENDPOINT}/estudiante/${estudiante_id}`, { method: "GET" });
  },

  // Filtrar por usuario
  getByUsuario: async (usuario_id) => {
    return apiCall(`${ENDPOINT}/usuario/${usuario_id}`, { method: "GET" });
  },

  // Filtrar por fecha
  getByFecha: async (fecha) => {
    return apiCall(`${ENDPOINT}/fecha/${fecha}`, { method: "GET" });
  },

  // Filtrar por estado
  getByEstado: async (estado) => {
    return apiCall(`${ENDPOINT}/estado/${encodeURIComponent(estado)}`, { method: "GET" });
  },

  // Crear registro
  create: async (data) => {
    return apiCall(ENDPOINT, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Editar registro
  update: async (registro_id, data) => {
    return apiCall(`${ENDPOINT}/${registro_id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Eliminar registro
  delete: async (registro_id) => {
    return apiCall(`${ENDPOINT}/${registro_id}`, { method: "DELETE" });
  },
};
