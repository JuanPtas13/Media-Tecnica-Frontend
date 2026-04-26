# Sistema Escolar - Frontend

Aplicación React con Vite, Tailwind CSS y autenticación JWT.

## 🚀 Instalación

### Requisitos
- Node.js >= 16
- npm o yarn

### Pasos

1. **Navegar al directorio del frontend:**
```bash
cd Front
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

## 📄 Estructura de Archivos

```
src/
├── components/        # Componentes reutilizables
├── context/          # AuthContext para gestión de estado
├── pages/
│   └── auth/
│       └── Login.jsx  # Formulario de login
├── services/
│   └── api.js        # Funciones para consumir el backend
├── routes/
│   └── ProtectedRoute.jsx  # HOC para proteger rutas
├── App.jsx           # Configuración de rutas
├── main.jsx          # Punto de entrada
└── index.css         # Estilos con Tailwind
```

## 🔐 Flujo de Autenticación

### Login
1. Usuario ingresa email y contraseña
2. Se envía POST a `http://localhost:8000/auth/login`
3. Backend retorna `access_token` y datos del usuario

### Token & Datos Guardados
```javascript
localStorage.setItem("token", response.access_token);
localStorage.setItem("user", JSON.stringify(response.user));
```

### Redirección por Rol
- **admin** → `/admin`
- **docente** → `/docente`
- **vigilante** → `/vigilante`

## 🛡️ Rutas Protegidas

Todas las rutas excepto `/login` están protegidas con `ProtectedRoute`:

```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

Si no hay token válido, redirige a `/login`.

## 🎨 Componente Login

### Características
- ✅ Diseño moderno tipo SaaS
- ✅ Inputs con validación HTML5
- ✅ Botón con estado de loading
- ✅ Mensaje de error dinámico
- ✅ Manejo de respuestas del backend
- ✅ Almacenamiento de JWT
- ✅ Redirección automática por rol

### Props esperadas del backend

**Request:**
```json
{
  "email": "usuario@example.com",
  "contraseña": "123456"
}
```

**Response Success (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLC...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "rol": "admin"
  }
}
```

**Response Error (401):**
```json
{
  "detail": "Credenciales incorrectas"
}
```

## 🪝 Hooks Personalizados

### useAuth
Accede al contexto de autenticación desde cualquier componente:

```jsx
import { useAuth } from "./context/AuthContext";

function MiComponente() {
  const { user, token, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <p>Hola, {user.email}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}
```

## 📦 Dependencias Principales

- **react**: Librería UI
- **react-router-dom**: Enrutamiento
- **tailwindcss**: Estilos CSS utility-first
- **vite**: Build tool y dev server

## ⚙️ Configuración

### Vite (`vite.config.js`)
- Puerto: `5173`
- Auto-open en navegador

### Tailwind (`tailwind.config.js`)
- Colores personalizados
- Estilos base configurados

### PostCSS (`postcss.config.js`)
- Tailwind procesado automáticamente

## 🔄 Desarrollo

### Compilar para producción
```bash
npm run build
```

### Preview de producción
```bash
npm run preview
```

## 🐛 Solución de Problemas

### "Cannot find module 'react'"
```bash
npm install
```

### CORS Error con Backend
Asegurar que el backend (FastAPI) tiene CORS habilitado:
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

### Token expirado
El contexto y las rutas protegidas validan el token.
Si está expirado, automáticamente redirige a login.

## 📝 Notas

- El token se guarda en localStorage (considera usar httpOnly cookies en producción)
- Las contraseñas se envían en texto plano en el body JSON (usa HTTPS en producción)
- El estado se mantiene mientras no se recargue la página
- Al cerrar sesión, se eliminan token y usuario del localStorage

## 🎯 Próximos Pasos

- [ ] Implementar refresh tokens
- [ ] Agregar validación de email en tiempo real
- [ ] Implementar remember me
- [ ] Agregar recuperación de contraseña
- [ ] Dashboards para cada rol
