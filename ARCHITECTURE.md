# 📐 Arquitectura del Sistema de Login

## Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO EN BROWSER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Accede a http://localhost:5173/login                        │
│                       ↓                                           │
│  2. Ve Login.jsx (Componente React)                             │
│     - Input Email                                                │
│     - Input Contraseña                                           │
│     - Botón Submit                                               │
│     - Error Message                                              │
│                       ↓                                           │
│  3. Ingresa credenciales y hace click                           │
│                       ↓                                           │
│  4. handleLogin() → useLogin Hook                               │
│                       ↓                                           │
│  5. loginUser() → api.js                                        │
│                       ↓                                           │
│  6. Fetch POST a http://localhost:8000/auth/login              │
│                       ↓                                           │
│     {"email": "...", "contraseña": "..."}                      │
│                       ↓                                           │
│              VIAJA A BACKEND FASTAPI                            │
│                       ↓                                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND FASTAPI                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /auth/login                                               │
│     ↓                                                             │
│  Valida email en BD                                              │
│  Valida contraseña con hash                                      │
│     ↓                                                             │
│  ✅ Válido → Retorna                                             │
│  {                                                               │
│    "access_token": "eyJ0eXAi...",                              │
│    "user": {                                                     │
│      "id": 1,                                                   │
│      "email": "usuario@example.com",                           │
│      "rol": "admin"  ← admin, docente, vigilante               │
│    }                                                             │
│  }                                                               │
│     ↓                                                             │
│  ❌ Inválido → Status 401                                       │
│  {"detail": "Credenciales incorrectas"}                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              VUELVE AL FRONTEND (BROWSER)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ✅ ÉXITO (Status 200):                                          │
│     ↓                                                             │
│  localStorage.setItem("token", access_token)                    │
│  localStorage.setItem("user", JSON.stringify(user))             │
│     ↓                                                             │
│  Lee rol: user.rol                                              │
│     ↓                                                             │
│  Navigate según rol:                                            │
│  - admin   → /admin                                             │
│  - docente → /docente                                           │
│  - vigilante → /vigilante                                       │
│     ↓                                                             │
│  ProtectedRoute valida token en rutas protegidas               │
│     ↓                                                             │
│  Acceso permitido a dashboard                                   │
│                                                                   │
│                                                                   │
│  ❌ ERROR (Status 401):                                          │
│     ↓                                                             │
│  Mostrar error: "Credenciales incorrectas"                      │
│  ↓                                                               │
│  Usuario permanece en /login                                    │
│  localStorage NO se modifica                                    │
│  ↓                                                               │
│  Usuario puede reintentar                                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estructura de Componentes

```
Login.jsx (Página)
  ├── useLogin() Hook
  │   ├── handleLogin()
  │   ├── loading state
  │   └── error state
  │
  ├── Form Inputs
  │   ├── Email Input
  │   └── Password Input
  │
  └── UI Elements
      ├── Logo (Gradient Badge)
      ├── Title "Sistema Escolar"
      ├── Subtitle "Control de Asistencia y Gestión"
      ├── Error Message (Condicional)
      ├── Submit Button (Con Loading Spinner)
      └── Footer Text
```

---

## Flujo de Datos

```
STATE MANAGEMENT:

┌──────────────────────────────────────────────────────┐
│              AuthContext (Context API)               │
├──────────────────────────────────────────────────────┤
│                                                       │
│  State:                                              │
│  - user: {id, email, rol}                           │
│  - token: string (JWT)                              │
│  - isAuthenticated: boolean                         │
│  - loading: boolean                                 │
│                                                       │
│  Methods:                                            │
│  - logout()                                         │
│                                                       │
│  Usado por: Cualquier componente con useAuth()      │
│                                                       │
└──────────────────────────────────────────────────────┘

PERSISTENCIA:

┌──────────────────────────────────────────────────────┐
│              localStorage (Browser)                  │
├──────────────────────────────────────────────────────┤
│                                                       │
│  token: "eyJ0eXAiOiJKV1QiLC..."                     │
│  user: '{"id": 1, "email": "...", "rol": "admin"}' │
│                                                       │
│  Cargado al iniciar la aplicación                   │
│  Sincronizado con AuthContext                       │
│  Limpiado al hacer logout                           │
│                                                       │
└──────────────────────────────────────────────────────┘

PROTECTED ROUTES:

┌──────────────────────────────────────────────────────┐
│          ProtectedRoute Wrapper                      │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Valida: ¿Existe token en localStorage?            │
│                                                       │
│  ✅ Sí → Renderiza componente protegido            │
│  ❌ No → Redirige a /login (Navigate)              │
│                                                       │
│  Usado en:                                           │
│  - /admin                                            │
│  - /docente                                          │
│  - /vigilante                                        │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## Árbol de Archivos Completo

```
Front/
│
├── 📄 index.html                    ← Punto de entrada HTML
├── 📄 package.json                  ← Dependencias
├── 📄 vite.config.js                ← Config Vite
├── 📄 tailwind.config.js            ← Config Tailwind
├── 📄 postcss.config.js             ← Config PostCSS
├── .env.example                     ← Variables de entorno
├── .gitignore                       ← Git ignore
│
├── 📋 README.md                     ← Documentación principal
├── 📋 QUICK_REFERENCE.md            ← Guía rápida
├── 📋 TESTING_GUIDE.md              ← Testing y debugging
│
└── src/
    │
    ├── main.jsx                     ← Entry point React
    ├── App.jsx                      ← Router setup
    ├── index.css                    ← Tailwind styles
    │
    ├── 🔐 pages/auth/
    │   └── Login.jsx                ← Componente Login
    │
    ├── 🔑 context/
    │   └── AuthContext.jsx          ← Auth provider y hook
    │
    ├── 🛣️  routes/
    │   └── ProtectedRoute.jsx       ← Protected route wrapper
    │
    ├── 📡 services/
    │   └── api.js                   ← API calls (loginUser, etc)
    │
    ├── 🪝 hooks/
    │   └── useLogin.js              ← Lógica de login hook
    │
    ├── 🧩 components/
    │   ├── layout/
    │   │   ├── Navbar.jsx
    │   │   └── Sidebar.jsx
    │   └── ui/
    │       ├── Card.jsx
    │       └── Table.jsx
    │
    ├── 🎨 assets/
    │   └── [imagen files]
    │
    └── 📚 utils/
        └── [utilidades]


TOTAL: 16+ archivos creados/configurados
```

---

## Variables de Entorno

```env
# Archivo: .env (crear desde .env.example)

VITE_API_BASE_URL=http://localhost:8000
VITE_ENVIRONMENT=development
```

Cambiar según el ambiente:

```env
# PRODUCCIÓN
VITE_API_BASE_URL=https://api.ejemplo.com
VITE_ENVIRONMENT=production
```

---

## Instalación & Ejecución

```bash
# 1. Navegar al frontend
cd Front

# 2. Instalar dependencias
npm install

# 3. (Opcional) Crear .env desde .env.example
cp .env.example .env

# 4. Ejecutar servidor de desarrollo
npm run dev

# Acceder a: http://localhost:5173
```

---

## Validación de Backend

El backend debe retornar en `POST /auth/login`:

```python
# FastAPI - app/routers/auth_router.py (EJEMPLO)

from fastapi import APIRouter, HTTPException
from app.schemas.auth import LoginSchema
from app.services.usuario_service import UsuarioService

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(credentials: LoginSchema):
    user = UsuarioService.authenticate(credentials.email, credentials.contraseña)
    
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    token = generate_jwt_token(user.id)
    
    return {
        "access_token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "rol": user.rol.nombre  # Asegúrate que sea string
        }
    }
```

---

## Testing Manual Rápido

```bash
# Terminal 1: Backend
cd Media-tecnica-Backend
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd Front
npm run dev

# Luego abrir http://localhost:5173/login
```

---

¡Arquitectura lista! 🚀
