# 🔍 DIAGNÓSTICO DEL ERROR 403 - ANÁLISIS COMPLETO

## 📊 Lo que está pasando

### **Backend (Correcto ✅)**
El backend devuelve en `/auth/login`:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 28800,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "nombre": "Admin",
    "rol": "admin",           ← ✅ El rol está aquí
    "rol_id": 1,
    "estado": true
  }
}
```

### **JWT Token (Incompleto ⚠️)**
El JWT contiene **SOLO**:
```javascript
// Payload decodificado del token
{
  "sub": "1",              ← Solo el ID del usuario
  "exp": 1703001234       ← Expiración
  // ❌ NO contiene el rol!
}
```

### **Frontend (Problema 🔴)**
En `AuthContext.jsx`, línea 84:
```javascript
const role = getRoleFromToken(storedToken);
// ↑ Busca 'rol' en el JWT, pero no está!
// Resultado: role = null → 403 Acceso Denegado
```

---

## 🛠️ SOLUCIÓN: Dos Opciones

### **OPCIÓN A: Mejor - Agregar rol al JWT (Backend)**

**Cambio en backend** → `app/routers/auth_router.py` línea 54:

```python
# ANTES:
access_token = create_access_token(
    data={"sub": str(usuario.id_usuario)},
    expires_delta=timedelta(hours=settings.JWT_EXPIRATION_HOURS)
)

# DESPUÉS:
access_token = create_access_token(
    data={
        "sub": str(usuario.id_usuario),
        "rol": usuario.rol.nombre if usuario.rol else "usuario"  ← AGREGAR ESTO
    },
    expires_delta=timedelta(hours=settings.JWT_EXPIRATION_HOURS)
)
```

**Resultado:** El JWT ahora contiene:
```javascript
{
  "sub": "1",
  "rol": "admin",  ← ✅ Ahora sí tiene el rol
  "exp": 1703001234
}
```

**Ventaja:** El frontend puede extraer el rol directamente del JWT en cualquier momento.

---

### **OPCIÓN B: Usar rol de localStorage (Frontend)**

**Sin cambios en backend.** En `src/utils/jwt.js`, modifica `getRoleFromToken()`:

```javascript
// ANTES: Busca en el JWT
export function getRoleFromToken(token) {
  try {
    const payload = decodeJWT(token);
    return payload?.rol || null;  // ❌ El JWT no tiene rol
  } catch (error) {
    return null;
  }
}

// DESPUÉS: Busca en el usuario guardado
export function getRoleFromToken(token) {
  try {
    // Primero intenta obtener del JWT (si backend agregó rol)
    const payload = decodeJWT(token);
    if (payload?.rol) {
      return payload.rol;
    }
    
    // Si no está en JWT, obtener del user en localStorage
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      return userData?.rol || null;
    }
    
    return null;
  } catch (error) {
    console.error("Error obteniendo rol:", error);
    return null;
  }
}
```

**Ventaja:** Funciona inmediatamente sin cambios en backend.

---

## 🎯 MI RECOMENDACIÓN

**Haz AMBAS cosas:**

1. **Backend (AHORA):** Agrega `"rol"` al payload del JWT
   - Más seguro (el servidor es fuente confiable)
   - El rol siempre viene validado por el servidor
   - Frontend no depende de localStorage

2. **Frontend (AHORA):** Actualiza `getRoleFromToken()` como Opción B
   - Proporciona compatibilidad hacia atrás
   - Si JWT tiene rol, lo usa
   - Si no, obtiene del user en localStorage

---

## ✅ IMPLEMENTACIÓN COMPLETA

Voy a hacer estos cambios ahora...
