# 🔐 Guía de Protección de Rutas por Rol en React

## 📚 Tabla de Contenidos
1. [Preguntas Frecuentes](#preguntas-frecuentes)
2. [Arquitectura de Seguridad](#arquitectura-de-seguridad)
3. [Cómo Funciona](#cómo-funciona)
4. [Uso en Componentes](#uso-en-componentes)
5. [Casos de Uso](#casos-de-uso)
6. [Troubleshooting](#troubleshooting)

---

## ❓ Preguntas Frecuentes

### 1. ¿Dónde guardar el JWT - localStorage vs httpOnly Cookie?

**localStorage (ACTUAL - Lo usamos):**
```
✅ VENTAJAS:
  - Fácil de acceder desde JavaScript
  - Funciona en todos los navegadores
  - No necesita configuración especial del servidor
  
❌ DESVENTAJAS:
  - Vulnerable a XSS (Cross-Site Scripting)
  - Si hay XSS, el atacante puede acceder al token
  - Más fácil de leer desde DevTools
```

**httpOnly Cookie (MÁS SEGURO - Recomendado después):**
```
✅ VENTAJAS:
  - Inmune a XSS (JavaScript no puede acceder)
  - Se envía automáticamente en cada request
  - Más seguro contra ataques
  
❌ DESVENTAJAS:
  - Vulnerable a CSRF (necesita token CSRF adicional)
  - Más complejo de configurar
  - Requiere configuración especial del servidor (CORS, SameSite)
```

**RECOMENDACIÓN:**
```
Para máxima seguridad:
1. Guardar el token en httpOnly cookie (no en localStorage)
2. Guardar un CSRF token en localStorage
3. Incluir el CSRF token en headers personalizados
4. El servidor valida ambos tokens
```

**PARA AHORA:**
localStorage es suficiente si:
- No tienes datos muy sensibles
- Tu servidor está protegido contra XSS
- Confías en tus desarrolladores

---

### 2. ¿Cómo extraer el rol del JWT sin librerías externas?

Usamos la función `decodeJWT()` en [src/utils/jwt.js](../src/utils/jwt.js):

```javascript
import { decodeJWT, getRoleFromToken, isTokenExpired } from './utils/jwt';

// Método 1: Obtener el rol directamente
const rol = getRoleFromToken(token);  // 'admin', 'docente', etc.

// Método 2: Obtener todo el payload
const payload = decodeJWT(token);
console.log(payload);  
// { rol: 'admin', user_id: 123, exp: 1234567890, ... }

// Método 3: Verificar expiración
if (isTokenExpired(token)) {
  console.log('Token expirado!');
}
```

**¿Cómo funciona sin librerías?**
```
1. JWT tiene 3 partes: header.payload.signature
2. El payload es base64url encoded
3. Usamos atob() para decodificar
4. Parseamos el JSON
5. Accedemos al campo 'rol'
```

**Nota de Seguridad:**
⚠️ NO validamos la FIRMA del JWT en el frontend.
✅ La firma se valida en el backend.
El frontend solo CONFÍA en que el backend envió un JWT válido.

---

### 3. ¿Cómo funciona ProtectedRoute?

```javascript
import ProtectedRoute from './routes/Protectedrute';

// USO 1: Solo verificar autenticación
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

// USO 2: Proteger por rol específico
<Route
  path="/admin"
  element={
    <ProtectedRoute 
      requiredRole="admin"
      showAccessDenied
    >
      <AdminPanel />
    </ProtectedRoute>
  }
/>

// USO 3: Permitir múltiples roles
<Route
  path="/reportes"
  element={
    <ProtectedRoute 
      requiredRole={['admin', 'docente']}
      showAccessDenied
    >
      <Reports />
    </ProtectedRoute>
  }
/>
```

**Parámetros:**
- `children`: Componente a mostrar si está autorizado
- `requiredRole` (opcional): String o array de roles permitidos
- `showAccessDenied` (opcional): Si true, redirige a /access-denied; si false, a /login

**Flujo de Validación:**
```
1. ¿Token existe?
   └─ NO → Redirigir a /login
   
2. ¿Token no está expirado?
   └─ SÍ (expirado) → Redirigir a /login
   
3. ¿Se requiere rol específico?
   └─ SÍ: ¿Rol coincide?
      └─ NO → Redirigir a /access-denied o /login
      
4. ✅ PERMITIR ACCESO
```

---

## 🏗️ Arquitectura de Seguridad

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  AuthContext.jsx (Estado global)                        │
│  ├─ token (JWT)                                         │
│  ├─ userRole (extraído del JWT)                         │
│  ├─ isAuthenticated (validado)                          │
│  └─ logout() (limpia estados)                           │
│                                                         │
│  ProtectedRoute.jsx (Guardia de rutas)                  │
│  ├─ Verifica autenticación                              │
│  ├─ Valida expiración                                   │
│  ├─ Verifica rol requerido                              │
│  └─ Redirige si no autorizado                           │
│                                                         │
│  jwt.js (Utilidades)                                    │
│  ├─ decodeJWT() - Parsea el JWT                         │
│  ├─ isTokenExpired() - Verifica exp                     │
│  ├─ getRoleFromToken() - Obtiene rol                    │
│  └─ getTokenTimeRemaining() - Tiempo hasta exp          │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       │ request + token en header
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI/Node)                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. Recibe request + token en Authorization header      │
│  2. Extrae y valida la FIRMA del JWT                    │
│  3. Verifica que no haya expirado                       │
│  4. Extrae rol y verifica permisos                      │
│  5. Retorna 200 OK o 401/403 Unauthorized              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Cómo Funciona

### 1. **Al Iniciar la Aplicación**

```javascript
// AuthContext.jsx - useEffect de carga inicial
useEffect(() => {
  const token = localStorage.getItem("token");
  
  // Validar que no esté expirado
  if (isTokenExpired(token)) {
    logout();  // Limpiar todo
    return;
  }
  
  // Extraer rol del JWT
  const role = getRoleFromToken(token);
  
  // Actualizar estado
  setToken(token);
  setUserRole(role);
  setLoading(false);
}, []);
```

### 2. **Mientras el Usuario Navega**

```javascript
// AuthContext.jsx - useEffect de monitoreo
useEffect(() => {
  if (!token) return;
  
  // Calcular tiempo hasta expiración
  const timeRemaining = getTokenTimeRemaining(token);
  
  // Si va a expirar en menos de 1 minuto
  if (timeRemaining < 60) {
    logout();  // Hacer logout automático
  }
  
  // Configurar alarma para logout automático
  const timer = setTimeout(() => {
    logout();
  }, timeRemaining * 1000);
  
  return () => clearTimeout(timer);
}, [token]);
```

### 3. **Al Intentar Acceder a una Ruta Protegida**

```javascript
// ProtectedRoute.jsx
if (!isAuthenticated || !token) {
  return <Navigate to="/login" replace />;
}

if (isTokenExpired(token)) {
  return <Navigate to="/login" replace />;
}

if (requiredRole && !allowedRoles.includes(userRole)) {
  return <Navigate to="/access-denied" replace />;
}

return children;  // ✅ Permitir acceso
```

---

## 💻 Uso en Componentes

### Acceder al contexto de autenticación

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { 
    user,           // { id: 1, email: 'admin@example.com', ... }
    token,          // 'eyJhbGciOiJIUzI1NiIs...'
    userRole,       // 'admin'
    isAuthenticated,// true/false
    hasRole,        // función
    logout,         // función
  } = useAuth();

  return (
    <div>
      {isAuthenticated && <p>Bienvenido, {user?.email}</p>}
      {userRole === 'admin' && <AdminTools />}
    </div>
  );
}
```

### Verificar roles de forma flexible

```javascript
const { hasRole } = useAuth();

// Verificar un rol
if (hasRole('admin')) {
  // Usuario es admin
}

// Verificar múltiples roles
if (hasRole(['admin', 'docente'])) {
  // Usuario es admin O docente
}

// En JSX
{hasRole('admin') && <AdminButton />}
{hasRole(['admin', 'docente']) && <ReportGenerator />}
```

### Hacer logout

```javascript
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <p>Usuario: {user?.email}</p>
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </nav>
  );
}
```

---

## 📋 Casos de Uso

### Caso 1: Panel de Admin (Solo Admin)
```javascript
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin" showAccessDenied>
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

### Caso 2: Reportes (Admin + Docente)
```javascript
<Route
  path="/reportes"
  element={
    <ProtectedRoute 
      requiredRole={['admin', 'docente']} 
      showAccessDenied
    >
      <Reports />
    </ProtectedRoute>
  }
/>
```

### Caso 3: Dashboard Personalizado
```javascript
function Dashboard() {
  const { userRole } = useAuth();

  if (userRole === 'admin') return <AdminDashboard />;
  if (userRole === 'docente') return <DocenteDashboard />;
  if (userRole === 'vigilante') return <VigilanteDashboard />;
  
  return <div>Rol desconocido</div>;
}

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### Caso 4: Mostrar/Ocultar Elementos por Rol
```javascript
function Navigation() {
  const { hasRole } = useAuth();

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      
      {hasRole('admin') && (
        <>
          <Link to="/usuarios">Usuarios</Link>
          <Link to="/configuracion">Configuración</Link>
        </>
      )}
      
      {hasRole(['admin', 'docente']) && (
        <Link to="/reportes">Reportes</Link>
      )}
    </nav>
  );
}
```

---

## 🚨 Troubleshooting

### Problema 1: "Token expirado" al cargar la página

**Causa:** El token en localStorage está expirado

**Solución:**
```javascript
// El AuthContext ya maneja esto automáticamente
// Pero si tienes problemas, verifica:

import { isTokenExpired } from './utils/jwt';

const token = localStorage.getItem('token');
if (isTokenExpired(token)) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Redirigir a login
}
```

### Problema 2: Usuario puede acceder a rutas que no debería

**Causa:** El `requiredRole` no está configurado en ProtectedRoute

**Solución:**
```javascript
// ❌ MALO - Sin validación de rol
<ProtectedRoute>
  <AdminPanel />
</ProtectedRoute>

// ✅ BIEN - Con validación de rol
<ProtectedRoute requiredRole="admin" showAccessDenied>
  <AdminPanel />
</ProtectedRoute>
```

### Problema 3: Cambio de rol no se refleja inmediatamente

**Causa:** El rol está cacheado en el contexto

**Solución:**
```javascript
// En tu API al cambiar rol:
const response = await updateUserRole(userId, newRole);

// Actualizar el contexto con el nuevo token
const { setAuthToken } = useAuth();
setAuthToken(response.new_token, response.user);

// O simplemente hacer logout y login de nuevo
const { logout } = useAuth();
logout();
navigate('/login');
```

### Problema 4: El token no se envía al backend

**Verificar en interceptor de API:**
```javascript
// src/services/api.js
export async function apiCall(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,  // ✅ Importante
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response.json();
}
```

### Problema 5: "useAuth debe usarse dentro de AuthProvider"

**Causa:** El componente no está dentro de AuthProvider

**Solución:**
Verificar que en [App.jsx](../App.jsx):
```javascript
<AuthProvider>  {/* ← Debe estar aquí */}
  <BrowserRouter>
    <Routes>
      {/* rutas aquí */}
    </Routes>
  </BrowserRouter>
</AuthProvider>
```

---

## 📝 Estructura de Archivos

```
src/
├── context/
│   └── AuthContext.jsx          ← Estado global de auth
├── routes/
│   └── Protectedrute.jsx        ← Guardia de rutas
├── utils/
│   └── jwt.js                   ← Funciones JWT
├── pages/
│   ├── auth/
│   │   └── Login.jsx
│   ├── admin/
│   │   └── AdminPanel.jsx
│   ├── docente/
│   │   └── DocentePanel.jsx
│   ├── vigilante/
│   │   └── VigilantPanel.jsx
│   └── UnauthorizedPage.jsx     ← 403 Forbidden
├── services/
│   └── api.js                   ← Llamadas HTTP
├── App.jsx                      ← Rutas principales
└── main.jsx
```

---

## 🔒 Checklist de Seguridad

- [ ] ✅ AuthContext valida expiración al cargar
- [ ] ✅ AuthContext monitorea expiración mientras navega
- [ ] ✅ ProtectedRoute verifica autenticación
- [ ] ✅ ProtectedRoute verifica expiración
- [ ] ✅ ProtectedRoute verifica rol requerido
- [ ] ✅ Todas las rutas admin tienen requiredRole
- [ ] ✅ El token se envía en Authorization header
- [ ] ✅ Backend valida la firma del JWT
- [ ] ✅ Backend valida permisos por rol
- [ ] ✅ El logout limpia token y userRole
- [ ] ⚠️ FUTURO: Migrar token a httpOnly cookie

---

**Última actualización:** Abril 2026
