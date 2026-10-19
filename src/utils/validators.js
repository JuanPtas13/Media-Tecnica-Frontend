/**
 * Utilidades de validación para formularios
 */

export const validators = {
  // Validar email
  email: (value) => {
    if (!value) return "Email es requerido";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Email inválido";
    return null;
  },

  // Validar contraseña
  password: (value, minLength = 6) => {
    if (!value) return "Contraseña es requerida";
    if (value.length < minLength) return `Mínimo ${minLength} caracteres`;
    return null;
  },

  // Validar nombre
  name: (value) => {
    if (!value) return "Nombre es requerido";
    if (value.trim().length < 2) return "Nombre debe tener al menos 2 caracteres";
    if (value.length > 100) return "Nombre muy largo";
    return null;
  },

  // Validar número de teléfono
  phone: (value) => {
    if (!value) return null; // Opcional
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value)) return "Teléfono inválido";
    return null;
  },

  // Validar URL
  url: (value) => {
    if (!value) return null; // Opcional
    try {
      new URL(value);
      return null;
    } catch {
      return "URL inválida";
    }
  },

  // Validar número
  number: (value, min = null, max = null) => {
    if (!value && value !== 0) return "Número es requerido";
    const num = Number(value);
    if (isNaN(num)) return "Debe ser un número";
    if (min !== null && num < min) return `Mínimo ${min}`;
    if (max !== null && num > max) return `Máximo ${max}`;
    return null;
  },

  // Validar fecha
  date: (value) => {
    if (!value) return "Fecha es requerida";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "Fecha inválida";
    return null;
  },

  // Validar que no esté vacío
  required: (value) => {
    if (!value || (typeof value === "string" && !value.trim())) {
      return "Este campo es requerido";
    }
    return null;
  },

  // Validar longitud mínima
  minLength: (value, min) => {
    if (!value) return null;
    if (value.length < min) return `Mínimo ${min} caracteres`;
    return null;
  },

  // Validar longitud máxima
  maxLength: (value, max) => {
    if (!value) return null;
    if (value.length > max) return `Máximo ${max} caracteres`;
    return null;
  },

  // Ejecutar múltiples validadores
  combine: (value, ...validators) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  },
};

/**
 * Hook para validación de formularios
 */
export const useValidation = () => {
  const validate = (value, validator) => {
    if (typeof validator === "function") {
      return validator(value);
    }
    if (Array.isArray(validator)) {
      return validators.combine(value, ...validator);
    }
    return null;
  };

  return { validate, validators };
};
