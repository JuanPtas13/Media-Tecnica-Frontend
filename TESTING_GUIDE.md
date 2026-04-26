# 🧪 Testing y Validación del Login

## ✅ Checklist Pre-Deployment

### Frontend

- [ ] `npm install` ejecutado sin errores
- [ ] `npm run dev` inicia sin errores en puerto 5173
- [ ] Login accesible en http://localhost:5173/login
- [ ] Inputs aceptan texto
- [ ] Botón responde a clicks
- [ ] Error message aparece en credenciales inválidas

### Backend

- [ ] Servidor FastAPI corriendo en http://localhost:8000
- [ ] Endpoint `/auth/login` disponible
- [ ] CORS habilitado para http://localhost:5173
- [ ] Retorna respuesta correcta en Success
- [ ] Retorna error 401 en credenciales inválidas

---

## 🔍 Validación Manual del Login

### Escenario 1: Credenciales Válidas

**Pasos:**
1. Abrir http://localhost:5173/login
2. Email: `admin@example.com`
3. Contraseña: `12345678`
4. Click en "Iniciar Sesión"

**Resultado esperado:**
```
✅ Spinner aparece en botón
✅ Token guardado en localStorage
✅ Usuario redirigido a /admin
✅ localStorage contiene:
   - token: "eyJ0eXAi..."
   - user: {"id": 1, "email": "admin@example.com", "rol": "admin"}
```

**Verificar en DevTools:**
```javascript
// En Console
localStorage.getItem("token")     // Debe retornar token
localStorage.getItem("user")      // Debe retornar user object
JSON.parse(localStorage.getItem("user"))  // Para ver estructura
```

### Escenario 2: Credenciales Inválidas

**Pasos:**
1. Abrir http://localhost:5173/login
2. Email: `wrong@example.com`
3. Contraseña: `wrongpassword`
4. Click en "Iniciar Sesión"

**Resultado esperado:**
```
✅ Spinner aparece
✅ Después de 2-3 segundos, spinner desaparece
✅ Mensaje rojo: "Credenciales incorrectas"
✅ Usuario permanece en /login
✅ localStorage NO se modifica
```

### Escenario 3: Email Vacío

**Pasos:**
1. Dejar email vacío
2. Ingresar contraseña
3. Click en "Iniciar Sesión"

**Resultado esperado:**
```
✅ Validación HTML5 por defecto
✅ Mensaje: "Por favor llena este campo"
✅ No se envía request al backend
```

### Escenario 4: Servidor No Disponible

**Pasos:**
1. Detener servidor backend
2. Intentar login con credenciales válidas
3. Esperar respuesta

**Resultado esperado:**
```
✅ Spinner aparece
✅ Después de timeout, error:
   "No se pudo conectar con el servidor"
✅ Usuario permanece en /login
```

---

## 📋 Respuestas del Backend

### ✅ Success (200)

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

**Frontend hace:**
- Guarda token en localStorage
- Guarda user en localStorage
- Redirige a /admin

---

### ❌ Error (401)

```json
{
  "detail": "Credenciales incorrectas"
}
```

**Frontend hace:**
- Muestra mensaje de error
- Mantiene usuario en login
- Permite reintentos

---

## 🐛 Solución de Problemas Comunes

### Problema 1: "Módulo no encontrado"
```bash
Error: Cannot find module 'react'
```

**Solución:**
```bash
rm -rf node_modules
npm install
```

---

### Problema 2: CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Verificar en Backend (FastAPI):**
```python
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

### Problema 3: Token no se guarda

**Verificar en Console:**
```javascript
localStorage.getItem("token")  // Debe retornar algo
```

**Causas posibles:**
1. Backend no retorna `access_token`
2. Respuesta en formato diferente
3. localStorage deshabilitado (browser incognito)

**Verificar en Network:**
1. F12 → Network Tab
2. Hacer login
3. Ver request/response en /auth/login
4. Verificar response tiene `access_token`

---

### Problema 4: No redirige después de login

**Verificar:**
```javascript
// En Console, después de logout:
localStorage.getItem("user")  // Debe estar null

// Verificar rol en user:
JSON.parse(localStorage.getItem("user")).rol  // admin, docente, vigilante
```

**Causas:**
1. Rol no es "admin", "docente", o "vigilante"
2. useNavigate no funciona (verificar rutas)
3. Token corrupto

---

### Problema 5: Botón no responde

**Verificar:**
1. Abrir DevTools → Console
2. Ver errores JavaScript
3. Verificar conexión a backend

**Solución:**
```javascript
// En Console:
localStorage.clear()  // Limpiar localStorage
location.reload()     // Recargar página
```

---

## 🔐 Security Checklist

- [ ] Contraseña NO se guarda en localStorage
- [ ] Token se envía en header `Authorization: Bearer <token>`
- [ ] Solo email y contraseña en body del login
- [ ] HTTPS en producción (no solo HTTP)
- [ ] Token con expiración en backend
- [ ] Validación de email con regex
- [ ] Rate limiting en endpoint de login
- [ ] Logs de intentos fallidos

---

## 📊 Monitoreo

### Estado del Application

```javascript
// En Console - Ver estado actual:
{
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user")),
  url: window.location.pathname,
  isAuthenticated: !!localStorage.getItem("token")
}
```

### Network Requests

1. F12 → Network Tab
2. Hacer login
3. Ver request a `/auth/login`:
   - Method: POST
   - Status: 200 (success) o 401 (error)
   - Headers: Content-Type: application/json
   - Body: {email, contraseña}
   - Response: {access_token, user}

---

## 📝 Ejemplos de Uso en Testing

### Con Postman

1. **POST** http://localhost:8000/auth/login
2. Body (JSON):
```json
{
  "email": "admin@example.com",
  "contraseña": "12345678"
}
```
3. Verificar response

### Con cURL

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","contraseña":"12345678"}'
```

---

## ✨ Features Completadas

✅ Login funcional  
✅ JWT tokens  
✅ Redirección por roles  
✅ Error handling  
✅ Loading states  
✅ Validación HTML5  
✅ localStorage integration  
✅ Protected routes  

---

¡Todo listo para testing! 🚀
