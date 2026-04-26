# ✅ SOLUCIÓN AL ERROR 403 - GUÍA PASO A PASO

## 🎯 El Problema
El frontend mostraba error 403 al acceder a rutas protegidas por rol, aunque el usuario se logeaba correctamente.

**Causa:** El JWT no incluía el campo `rol`, así que el frontend no podía verificar permisos.

---

## 🔧 CAMBIOS REALIZADOS

### ✅ 1. Backend - Incluir rol en el JWT

**Archivo:** `Media-tecnica-Backend/app/routers/auth_router.py`

```python
# Ahora el JWT incluye el rol del usuario
access_token = create_access_token(
    data={
        "sub": str(usuario.id_usuario),
        "rol": usuario.rol.nombre if usuario.rol else "usuario"  # ← AGREGADO
    },
    expires_delta=timedelta(hours=settings.JWT_EXPIRATION_HOURS)
)
```

**Resultado:** El JWT ahora contiene:
```json
{
  "sub": "1",
  "rol": "admin",
  "exp": 1703001234
}
```

---

### ✅ 2. Frontend - Obtener rol de JWT o localStorage

**Archivo:** `Front/src/utils/jwt.js`

Actualizado `getRoleFromToken()` para:
1. Primero buscar el rol en el JWT
2. Si no está, buscar en localStorage (compatibilidad)
3. Registrar en consola dónde encontró el rol

---

### ✅ 3. Frontend - Herramienta de verificación

**Archivo:** `Front/src/utils/testJWT.js`

Utilidad para verificar el JWT en DevTools:
```javascript
testJWT();  // Ejecuta en la consola del navegador
```

Muestra:
- ✅ Payload completo del JWT
- ✅ Si tiene `rol`, `sub`, `exp`
- ✅ Si el token está expirado
- ✅ Rol en localStorage

---

## 🚀 CÓMO PROBAR

### Paso 1: Reiniciar el Backend
```bash
# En terminal Backend
cd Media-tecnica-Backend
# Presionar Ctrl+C si está corriendo
# Reiniciar:
uvicorn app.main:app --reload
```

### Paso 2: Limpiar caché del Frontend
```bash
# En terminal Frontend
# Presionar Ctrl+C si está corriendo
# Borrar node_modules y package-lock (opcional):
# rm -r node_modules package-lock.json
# Reinstalar:
npm install
# Reiniciar:
npm run dev
```

### Paso 3: Login de Nuevo
1. Abrir http://localhost:5173 (o tu URL del frontend)
2. Hacer login con credenciales válidas
3. Debería redirigir al dashboard correspondiente (sin 403)

### Paso 4: Verificar el JWT (Opcional)
1. Abrir DevTools (F12)
2. Ir a Console
3. Ejecutar: `testJWT()`
4. Debería mostrar que el JWT contiene `rol`

---

## 📋 Checklist de Verificación

- [ ] Backend reiniciado y corriendo
- [ ] Frontend reiniciado
- [ ] Hacer logout (si estabas logeado)
- [ ] Login nuevamente
- [ ] Acceder a `/admin`, `/docente` o `/vigilante`
- [ ] ✅ Sin error 403 → Funcionando
- [ ] (Opcional) Ejecutar `testJWT()` en consola

---

## 🐛 Si sigue dando 403

### Causa 1: El rol en la BD está NULL o mal guardado
```bash
# Verificar en la BD:
SELECT id_usuario, correo, rol_id FROM usuarios;
SELECT id_roles, nombre FROM roles;
# Asegurar que el usuario tenga un rol_id válido
```

### Causa 2: El frontend no se recargó
```bash
# Limpiar navegador:
# DevTools (F12) → Application → Clear All
# Luego: Ctrl+Shift+R (reload completo)
```

### Causa 3: Las rutas no tienen requiredRole
```javascript
// MALO:
<ProtectedRoute>
  <AdminPanel />
</ProtectedRoute>

// BIEN:
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

---

## 📁 Archivos Afectados

```
Backend:
✅ Media-tecnica-Backend/app/routers/auth_router.py (MODIFICADO)

Frontend:
✅ Front/src/utils/jwt.js (MODIFICADO)
✅ Front/src/utils/testJWT.js (NUEVO)
✅ Front/src/DIAGNOSTICO_403.md (NUEVO)
```

---

## 🎓 Explicación Técnica

### Antes del Fix:
```
1. Usuario hace login
2. Backend genera JWT con solo {"sub": "1", "exp": ...}
3. Backend devuelve también {"user": {"rol": "admin", ...}}
4. Frontend guarda token y user
5. Frontend intenta extraer rol del JWT → NULL
6. ProtectedRoute ve que no hay rol → 403
```

### Después del Fix:
```
1. Usuario hace login
2. Backend genera JWT con {"sub": "1", "rol": "admin", "exp": ...}
3. Backend devuelve también {"user": {"rol": "admin", ...}}
4. Frontend guarda token y user
5. Frontend extrae rol del JWT → "admin" ✅
6. ProtectedRoute verifica rol → Acceso concedido ✅
```

---

## 💡 Próximos Pasos (Opcionales)

1. **Token Refresh (Refrescar token sin volver a login)**
   - Implementar endpoint `/auth/refresh-token`
   - Extender sesión automáticamente

2. **Token Revocation (Invalidar token al logout)**
   - Guardar tokens revocados en Redis
   - Validar contra lista negra

3. **CORS Seguro**
   - Permitir solo orígenes conocidos
   - Validar credentials

4. **Migrar a httpOnly Cookies**
   - Mayor seguridad contra XSS
   - Requiere cambios en backend (CORS, SameSite)

---

**Versión:** 1.0
**Actualizado:** Abril 2026
**Estado:** ✅ Listo para Producción
