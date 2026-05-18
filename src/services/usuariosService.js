import { apiCall } from "./api";

const ENDPOINT = "/usuarios";

export const usuariosService = {
  // Listar todos los usuarios
  getAll: async () => {
    return apiCall(ENDPOINT, { method: "GET" });
  },

  // Obtener usuarios activos
  getActivos: async () => {
    return apiCall(`${ENDPOINT}/activos`, { method: "GET" });
  },

  // Crear usuario
  create: async (data) => {
    return apiCall(ENDPOINT, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Actualizar usuario
  update: async (usuario_id, data) => {
    return apiCall(`${ENDPOINT}/${usuario_id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Eliminar usuario
  delete: async (data) => {
    return apiCall(ENDPOINT, {
      method: "DELETE",
      body: JSON.stringify(data),
    });
  },
};
