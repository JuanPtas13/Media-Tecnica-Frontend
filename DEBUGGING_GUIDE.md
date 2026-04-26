# 🐛 Debugging del Login - Guía Práctica

## 🎯 Verificar Estado del Sistema

### En la Consola del Browser (F12)

#### 1. Ver Token Guardado
```javascript
// ✅ Si existe token
localStorage.getItem("token")
// Retorna: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

// ❌ Si NO existe
localStorage.getItem("token")
// Retorna: null
```

#### 2. Ver Usuario Guardado
```javascript
// ✅ Si existe usuario
const user = JSON.parse(localStorage.getItem("user"))
console.log(user)
// {id: 1, email: "admin@example.com", rol: "admin"}

// ❌ Si NO existe
localStorage.getItem("user")
// Retorna: null
```

#### 3. Verificar Estado de Autenticación
```javascript
const isAuthenticated = !!localStorage.getItem("token")
console.log(isAuthenticated)  // true o false
```

---

## 🔍 Network Debugging

### Ver la Solicitud POST

1. Abre DevTools: **F12**
2. Ve a pestaña: **Network**
3. Intenta hacer login
4. Busca la solicitud `login`
5. Click en ella para ver detalles:

#### Tab "Headers"
```
Request URL: http://localhost:8000/auth/login
Request Method: POST
Status Code: 200 (éxito) o 401 (error)
Content-Type: application/json
```

#### Tab "Request Payload"
```json
{
  "email": "admin@example.com",
  "contraseña": "12345678"
}
```

#### Tab "Response"
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "rol": "admin"
  }
}
```

---

## 🚨 Errores Comunes y Soluciones

### Error 1: "Failed to fetch"

**Síntoma:**
```
Uncaught (in promise) TypeError: Failed to fetch
```

**Causa:**
- Backend no está corriendo
- URL del backend es incorrecta
- CORS no configurado

**Verificar:**
```bash
# ¿Está el backend ejecutándose?
ps aux | grep uvicorn  # Linux/Mac
tasklist | findstr uvicorn  # Windows

# ¿Está en puerto 8000?
curl http://localhost:8000/docs
```

**Solucionar:**
```bash
# 1. Verifica que FastAPI esté corriendo
cd Media-tecnica-Backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 2. Verifica CORS en FastAPI
# Debe tener en app/main.py:
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Error 2: CORS Policy Blocked

**Síntoma:**
```
Access to XMLHttpRequest at 'http://localhost:8000/auth/login' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Causa:**
- Backend no tiene CORS habilitado
- CORS no permite el origin correcto

**Verificar:**
```javascript
// En Console
fetch("http://localhost:8000/auth/login", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({email: "test@test.com", contraseña: "123"})
})
```

**Solucionar en Backend (FastAPI):**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Desarrollo
        "https://tudominio.com"   # Producción
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Error 3: "Credenciales incorrectas" cuando son válidas

**Síntoma:**
- Backend retorna 401
- Credenciales correctas en BD

**Verificar:**
```javascript
// 1. ¿Qué recibe el backend?
// En FastAPI, agrega logging:
print(f"Email: {credentials.email}")
print(f"Contraseña: {credentials.contraseña}")

// 2. ¿Cómo valida el backend?
// Verifica que la contraseña esté hasheada correctamente
```

**Solucionar:**
```python
# En FastAPI - Verifica el servicio de usuario
from app.services.usuario_service import UsuarioService

user = UsuarioService.authenticate("admin@example.com", "123456")
print(user)  # Debe retornar usuario objeto, no None
```

---

### Error 4: Token se guarda pero NO redirige

**Síntoma:**
- localStorage tiene token
- Página permanece en /login
- No hay redirección

**Verificar:**
```javascript
// ¿Cuál es el rol?
const user = JSON.parse(localStorage.getItem("user"))
console.log(user.rol)  // Debe ser: "admin", "docente", o "vigilante"

// ¿React Router está funcionando?
console.log(window.location.pathname)
```

**Problema común:**
```javascript
// ❌ Rol con capitalización incorrecta
{"rol": "Admin"}  // ← Admin (mayúscula) NO funciona

// ✅ Correcto
{"rol": "admin"}  // ← admin (minúscula)
```

**Solucionar en Backend:**
```python
# FastAPI - Asegúrate que retorna lowercase
return {
    "access_token": token,
    "user": {
        "id": user.id,
        "email": user.email,
        "rol": user.rol.nombre.lower()  # ← .lower()!
    }
}
```

---

### Error 5: Inputs no responden

**Síntoma:**
- Inputs deshabilitados (grises)
- No puedes escribir
- Botón no responde

**Verificar:**
```javascript
// En Console, después de recargar:
localStorage.getItem("token")  // ¿Hay token viejo?

// Si hay token viejo del login anterior:
localStorage.removeItem("token")
localStorage.removeItem("user")
location.reload()
```

---

## 🧪 Casos de Prueba

### Test 1: Login Exitoso

```bash
# En Terminal, usa curl:
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","contraseña":"12345678"}'

# Response esperado:
# {
#   "access_token": "eyJ0eXAi...",
#   "user": {"id": 1, "email": "admin@example.com", "rol": "admin"}
# }
```

### Test 2: Login Fallido

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@example.com","contraseña":"wrong"}'

# Response esperado (Status 401):
# {"detail": "Credenciales incorrectas"}
```

### Test 3: Verificar Token en Header

```bash
# Después de login, verifica que el token funciona:
curl -H "Authorization: Bearer eyJ0eXAi..." \
  http://localhost:8000/usuarios/me  # Endpoint protegido
```

---

## 🔧 Resetear Estado Completamente

```javascript
// En Console - Limpia todo y recarga:
localStorage.clear()
sessionStorage.clear()
location.reload()

// Ahora deberías estar en /login sin token
```

---

## 📊 Monitoreo en Vivo

### Script de Debugging (Copiar en Console)

```javascript
// Función para monitorear estado en vivo
function statusCheck() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  
  console.clear();
  console.log("=== LOGIN STATUS ===");
  console.log("URL:", window.location.pathname);
  console.log("Token:", token ? "✅ Existe" : "❌ No existe");
  console.log("User:", user ? "✅ Existe" : "❌ No existe");
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log("  - ID:", userData.id);
      console.log("  - Email:", userData.email);
      console.log("  - Rol:", userData.rol);
    } catch (e) {
      console.log("  ❌ Error al parsear user");
    }
  }
  
  console.log("===================");
}

// Ejecutar cada 2 segundos
setInterval(statusCheck, 2000);
```

---

## 🎨 Verificar UI

### El componente debe mostrar:

```
✅ Logo (círculo azul degradado)
✅ Título "Sistema Escolar"
✅ Subtítulo "Control de Asistencia y Gestión"
✅ Label "Correo Electrónico"
✅ Input type="email"
✅ Label "Contraseña"
✅ Input type="password"
✅ Botón grande azul "Iniciar Sesión"
```

### En loading debe mostrar:

```
✅ Spinner rotando en el botón
✅ Texto "Autenticando..."
✅ Botón deshabilitado (gris)
✅ Inputs deshabilitados
```

### En error debe mostrar:

```
✅ Caja roja con mensaje
✅ "Credenciales incorrectas"
✅ Botón vuelve a estar habilitado
```

---

## 💾 Exportar Logs

```javascript
// Copiar todo el estado para compartir en soporte:
const debug = {
  timestamp: new Date().toISOString(),
  url: window.location.href,
  token: localStorage.getItem("token") ? "EXISTS" : "MISSING",
  user: localStorage.getItem("user"),
  userAgent: navigator.userAgent,
  // NO INCLUYAS contraseñas aquí
}

console.log(JSON.stringify(debug, null, 2))
console.save(debug, "debug.json")
```

---

## ✅ Performance Checks

### Tiempo de respuesta esperado

```
< 500ms   ✅ Excelente
500-1000ms ✅ Bueno
> 1000ms  ⚠️  Revisar backend
```

### Ver en DevTools:

1. F12 → Network
2. Hacer login
3. Click en `login` request
4. Ver "Time" o "Duration"

---

## 📱 Testing en Diferentes Dispositivos

```javascript
// En Console - Simular móvil:
// DevTools → Ctrl+Shift+M

// Verificar responsive:
// - ¿Se centra bien el login?
// - ¿Los inputs caben en pantalla?
// - ¿El botón es clickeable?
```

---

¡Con esta guía podrás debuggear cualquier problema! 🚀
