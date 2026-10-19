import { apiCall } from "./api";

const ENDPOINT = "/estudiantes";

export const estudiantesService = {
  // Listar todos los estudiantes
  getAll: async (limit = 100) => {
    return apiCall(`${ENDPOINT}?limit=${limit}`, { method: "GET" });
  },

  // Obtener estudiantes activos
  getActivos: async () => {
    return apiCall(`${ENDPOINT}/activos`, { method: "GET" });
  },

  // Buscar estudiantes
  search: async (query) => {
    return apiCall(`${ENDPOINT}/buscar?query=${encodeURIComponent(query)}`, {
      method: "GET",
    });
  },

  // Filtrar por grado
  getByGrade: async (grado) => {
    return apiCall(`${ENDPOINT}/grado/${grado}`, { method: "GET" });
  },

  // Crear estudiante
  create: async (data) => {
    return apiCall(ENDPOINT, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Actualizar estudiante
  update: async (estudiante_id, data) => {
    return apiCall(`${ENDPOINT}/${estudiante_id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Eliminar estudiante
  delete: async (estudiante_id) => {
    return apiCall(`${ENDPOINT}/${estudiante_id}`, { method: "DELETE" });
  },
};
