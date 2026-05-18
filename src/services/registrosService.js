import { apiCall } from "./api";

const ENDPOINT = "/registros";

export const registrosService = {
  // Listar todos los registros
  getAll: async () => {
    return apiCall(ENDPOINT, { method: "GET" });
  },

  // Obtener últimos registros
  getUltimos: async () => {
    return apiCall(`${ENDPOINT}/ultimos`, { method: "GET" });
  },

  // Filtrar por estudiante
  getByEstudiante: async (estudiante_id) => {
    return apiCall(`${ENDPOINT}/estudiante_id?id=${estudiante_id}`, {
      method: "GET",
    });
  },

  // Filtrar por usuario
  getByUsuario: async (usuario_id) => {
    return apiCall(`${ENDPOINT}/usuario_id?id=${usuario_id}`, {
      method: "GET",
    });
  },

  // Filtrar por fecha
  getByFecha: async (fecha) => {
    return apiCall(`${ENDPOINT}/fecha?fecha=${fecha}`, {
      method: "GET",
    });
  },

  // Filtrar por estado
  getByEstado: async (estado) => {
    return apiCall(`/registro/estado?estado=${estado}`, {
      method: "GET",
    });
  },

  // Crear registro
  create: async (data) => {
    return apiCall(ENDPOINT, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Editar registro
  update: async (data) => {
    return apiCall("/registro", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Eliminar registro
  delete: async (data) => {
    return apiCall("/registro", {
      method: "DELETE",
      body: JSON.stringify(data),
    });
  },
};
