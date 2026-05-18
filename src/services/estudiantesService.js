import { apiCall } from "./api";

const ENDPOINT = "/estudiantes";

export const estudiantesService = {
  // Listar todos los estudiantes
  getAll: async () => {
    return apiCall(ENDPOINT, { method: "GET" });
  },

  // Obtener estudiantes activos
  getActivos: async () => {
    return apiCall(`${ENDPOINT}/activos`, { method: "GET" });
  },

  // Buscar estudiantes
  search: async (query) => {
    return apiCall(`${ENDPOINT}/buscar?q=${encodeURIComponent(query)}`, {
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
  update: async (data) => {
    return apiCall(ENDPOINT, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Eliminar estudiante
  delete: async (data) => {
    return apiCall(ENDPOINT, {
      method: "DELETE",
      body: JSON.stringify(data),
    });
  },
};
