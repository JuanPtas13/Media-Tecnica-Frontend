# 🚀 Login - Guía Rápida

## ✅ Archivo Creado

**Componente Login:** `src/pages/auth/Login.jsx`

## 🎯 Características

✅ Diseño moderno tipo SaaS  
✅ Conectado al backend FastAPI  
✅ Manejo de errores  
✅ Loading state  
✅ Redirección por rol  
✅ JWT guardado en localStorage  

## 📋 Requisitos Funcionales Completados

### 1. ✅ Envío de credenciales
```javascript
POST http://localhost:8000/auth/login
{
  "email": "usuario@example.com",
  "contraseña": "123456"
}
```

### 2. ✅ Almacenamiento de token
```javascript
localStorage.setItem("token", access_token);
localStorage.setItem("user", JSON.stringify(user));
```

### 3. ✅ Redirección por rol
```javascript
- admin   → /admin
- docente → /docente  
- vigilante → /vigilante
```

### 4. ✅ Manejo de errores
- Mensaje: "Credenciales incorrectas"
- Validación HTML5 (email requerido, contraseña requerida)

### 5. ✅ Loading state
- Botón deshabilitado mientras carga
- Spinner animated en el botón
- Texto: "Autenticando..."

## 🛠️ Stack Tecnológico

| Herramienta | Versión | Función |
|---|---|---|
| React | ^18.2.0 | Framework UI |
| Vite | ^5.0.0 | Build tool |
| React Router | ^6.20.0 | Enrutamiento |
| Tailwind CSS | ^3.4.1 | Estilos |

## 📁 Archivos Creados

```
Front/
├── src/
│   ├── pages/auth/Login.jsx          ✨ Componente Login
│   ├── services/api.js                ✨ Función loginUser()
│   ├── context/AuthContext.jsx        ✨ Contexto de autenticación
│   ├── routes/ProtectedRoute.jsx      ✨ HOC de rutas protegidas
│   ├── App.jsx                        ✨ Configuración de rutas
│   ├── main.jsx                       ✨ Punto de entrada
│   └── index.css                      ✨ Estilos globales
├── index.html                         ✨ HTML base
├── package.json                       ✨ Dependencias
├── vite.config.js                     ✨ Configuración Vite
├── tailwind.config.js                 ✨ Configuración Tailwind
├── postcss.config.js                  ✨ Configuración PostCSS
├── .gitignore                         ✨ Git ignore
└── README.md                          ✨ Documentación

Total: 14 archivos creados
```

## 🚀 Instalación Rápida

```bash
# 1. Navegar al directorio
cd Front

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

Acceder a: **http://localhost:5173**

## 📱 UI/UX Completado

✅ Logo centrado (círculo azul con icono)  
✅ Título: "Sistema Escolar"  
✅ Subtítulo: "Control de Asistencia y Gestión"  
✅ Card blanca con bordes redondeados  
✅ Sombra suave  
✅ Inputs modernos con padding  
✅ Botón azul con hover effect  
✅ Gradiente de fondo  
✅ Validación en tiempo real  

## 🔌 Integración con Backend

### Backend debe retornar:
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

### CORS debe estar habilitado:
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

## 🪝 Usar AuthContext en Otros Componentes

```jsx
import { useAuth } from "./context/AuthContext";

function MiComponente() {
  const { user, token, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Rol: {user.rol}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🧪 Testing Manual

1. Abrir http://localhost:5173/login
2. Ingresar email y contraseña
3. Hacer click en "Iniciar Sesión"
4. Verificar:
   - [ ] Loading spinner aparece
   - [ ] Token guardado en localStorage
   - [ ] Usuario redirigido a ruta según rol
   - [ ] En error, mostrar mensaje

## ⚡ Próximas Optimizaciones

- [ ] Agregar validación de email en tiempo real
- [ ] Remember me checkbox
- [ ] Mostrar/ocultar contraseña
- [ ] Recuperación de contraseña
- [ ] Social login (Google, GitHub)
- [ ] Refresh tokens automáticos

## 📞 Soporte

Si el backend retorna error 401:
```javascript
// El frontend mostrará: "Credenciales incorrectas"
// Verificar en backend:
// - Email existe en BD
// - Contraseña es correcta
// - Endpoint retorna estructura correcta
```

---

✨ **¡Listo para usar!** ✨

Ejecuta `npm install` y `npm run dev` para empezar.
