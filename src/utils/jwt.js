/**
 * Utilidades para trabajar con JWT sin librerías externas
 * 
 * SEGURIDAD: Esta utilidad es SOLO para lectura del payload.
 * NO intenta validar la firma (eso debe hacerlo el servidor al aceptar el token).
 * Solo verifica que el token tenga formato correcto y que no haya expirado.
 */

/**
 * Decodifica el payload de un JWT sin validar la firma
 * @param {string} token - Token JWT (formato: header.payload.signature)
 * @returns {object|null} - Payload decodificado o null si es inválido
 */
export function decodeJWT(token) {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    // JWT tiene 3 partes separadas por puntos
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Token inválido: no tiene 3 partes');
      return null;
    }

    // Obtener el payload (segunda parte)
    const payload = parts[1];

    // Decodificar de base64. atob() solo funciona con base64 standard.
    // JWT usa base64url (sin padding = en algunos casos)
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

    // Parsear el JSON
    const payloadObj = JSON.parse(decodedPayload);

    return payloadObj;
  } catch (error) {
    console.error('Error al decodificar JWT:', error);
    return null;
  }
}

/**
 * Verifica si un token JWT ha expirado
 * @param {string} token - Token JWT
 * @returns {boolean} - true si ha expirado, false si es válido
 */
export function isTokenExpired(token) {
  try {
    const payload = decodeJWT(token);

    if (!payload) {
      return true; // Token inválido se considera expirado
    }

    // El payload debe tener el campo 'exp' (expiration time en segundos)
    if (!payload.exp) {
      console.warn('Token sin campo exp (expiración)');
      return true;
    }

    // Obtener el tiempo actual en segundos (exp está en segundos, Date.now() en ms)
    const now = Math.floor(Date.now() / 1000);

    // Si exp <= ahora, está expirado
    return payload.exp <= now;
  } catch (error) {
    console.error('Error al validar expiración:', error);
    return true; // Si hay error, consideramos que expiró (por seguridad)
  }
}

/**
 * Obtiene el rol del usuario desde el JWT o localStorage
 * 
 * Intenta obtener del JWT primero (más seguro, si el backend lo incluye),
 * si no está disponible, obtiene del objeto user guardado en localStorage.
 * 
 * @param {string} token - Token JWT
 * @returns {string|null} - Rol del usuario o null
 */
export function getRoleFromToken(token) {
  try {
    // Primero intenta obtener del JWT
    const payload = decodeJWT(token);
    if (payload?.rol) {
      console.log("✓ Rol obtenido del JWT:", payload.rol);
      return payload.rol;
    }

    // Si no está en JWT, obtener del user en localStorage
    // (Compatibilidad con backends que aún no incluyen rol en JWT)
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      if (userData?.rol) {
        console.log("✓ Rol obtenido de localStorage:", userData.rol);
        return userData.rol;
      }
    }

    console.warn("⚠️ No se encontró rol en JWT ni en localStorage");
    return null;
  } catch (error) {
    console.error('Error al obtener rol del token:', error);
    return null;
  }
}

/**
 * Obtiene el tiempo restante hasta que expire el token (en segundos)
 * @param {string} token - Token JWT
 * @returns {number} - Segundos restantes, o 0 si ya expiró
 */
export function getTokenTimeRemaining(token) {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return 0;

    const now = Math.floor(Date.now() / 1000);
    const remaining = payload.exp - now;

    return remaining > 0 ? remaining : 0;
  } catch (error) {
    console.error('Error al obtener tiempo restante:', error);
    return 0;
  }
}

/**
 * Valida que un token sea válido (formato correcto, no expirado)
 * @param {string} token - Token JWT
 * @returns {boolean} - true si es válido, false si no
 */
export function isValidToken(token) {
  if (!token) return false;

  const payload = decodeJWT(token);
  if (!payload) return false;

  return !isTokenExpired(token);
}

/**
 * Obtiene todos los datos del payload del token
 * @param {string} token - Token JWT
 * @returns {object|null} - Payload completo o null
 */
export function getTokenPayload(token) {
  return decodeJWT(token);
}
