/**
 * EJEMPLOS PRÁCTICOS - Protección de Rutas por Rol
 * 
 * Este archivo muestra ejemplos concretos de cómo usar
 * el sistema de protección de rutas por rol.
 */

// ============================================================
// 1. USAR AuthContext EN UN COMPONENTE
// ============================================================

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function NavbarExample() {
  const { user, userRole, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return <nav>Por favor inicia sesión</nav>;
  }

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <div>
        <h1>Mi App</h1>
        <p>Usuario: {user?.email} | Rol: {userRole}</p>
      </div>

      <div className="flex gap-4 items-center">
        {/* Mostrar botón solo si es admin */}
        {hasRole('admin') && (
          <button
            onClick={() => navigate('/admin')}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Panel Admin
          </button>
        )}

        {/* Mostrar botón si es admin O docente */}
        {hasRole(['admin', 'docente']) && (
          <button
            onClick={() => navigate('/reportes')}
            className="bg-green-600 px-4 py-2 rounded"
          >
            Reportes
          </button>
        )}

        {/* Botón de logout para todos */}
        <button
          onClick={handleLogout}
          className="bg-gray-700 px-4 py-2 rounded"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}

// ============================================================
// 2. PROTEGER UNA RUTA EN APP.JSX
// ============================================================

// EJEMPLO 1: Ruta solo para admin
// <Route
//   path="/admin"
//   element={
//     <ProtectedRoute requiredRole="admin" showAccessDenied>
//       <AdminPanel />
//     </ProtectedRoute>
//   }
// />

// EJEMPLO 2: Ruta para docente y admin
// <Route
//   path="/calificaciones"
//   element={
//     <ProtectedRoute 
//       requiredRole={['admin', 'docente']} 
//       showAccessDenied
//     >
//       <GradesPage />
//     </ProtectedRoute>
//   }
// />

// EJEMPLO 3: Ruta protegida sin verificar rol específico
// (solo verifica que esté autenticado)
// <Route
//   path="/perfil"
//   element={
//     <ProtectedRoute>
//       <ProfilePage />
//     </ProtectedRoute>
//   }
// />

// ============================================================
// 3. COMPONENTE CON LÓGICA CONDICIONAL POR ROL
// ============================================================

function DashboardExample() {
  const { userRole, user } = useAuth();

  if (userRole === 'admin') {
    return (
      <div className="p-8">
        <h1>Dashboard del Administrador</h1>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Card title="Total de Usuarios" value="250" />
          <Card title="Reportes" value="42" />
          <Card title="Sistemas Activos" value="5" />
          <Card title="Alertas" value="3" />
        </div>
        <AdminTools />
      </div>
    );
  }

  if (userRole === 'docente') {
    return (
      <div className="p-8">
        <h1>Dashboard del Docente</h1>
        <p>Bienvenido, {user?.nombre}</p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <Card title="Mis Cursos" value="4" />
          <Card title="Estudiantes" value="120" />
          <Card title="Tareas Pendientes" value="8" />
        </div>
        <ClassesList />
      </div>
    );
  }

  if (userRole === 'vigilante') {
    return (
      <div className="p-8">
        <h1>Dashboard de Vigilancia</h1>
        <ScannerMap />
        <RecentActivity />
      </div>
    );
  }

  return <div>Rol no reconocido: {userRole}</div>;
}

// ============================================================
// 4. USAR FUNCIONES JWT DIRECTAMENTE
// ============================================================

import { 
  decodeJWT, 
  getRoleFromToken, 
  isTokenExpired,
  getTokenTimeRemaining 
} from '../utils/jwt';

function JWTUtilitiesExample() {
  const token = localStorage.getItem('token');

  // Obtener el rol
  const role = getRoleFromToken(token);
  console.log('Rol actual:', role);

  // Verificar si expiró
  const hasExpired = isTokenExpired(token);
  console.log('Token expirado:', hasExpired);

  // Obtener tiempo restante (en segundos)
  const timeLeft = getTokenTimeRemaining(token);
  console.log(`Token expira en ${timeLeft} segundos (${Math.floor(timeLeft / 60)} minutos)`);

  // Decodificar todo el payload
  const payload = decodeJWT(token);
  console.log('Payload completo:', payload);
  // {
  //   rol: 'admin',
  //   user_id: 123,
  //   email: 'admin@example.com',
  //   exp: 1234567890,
  //   iat: 1234564290
  // }

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3>Información del Token</h3>
      <p>Rol: {role}</p>
      <p>Expirado: {hasExpired ? 'Sí' : 'No'}</p>
      <p>Expira en: {Math.floor(timeLeft / 60)} minutos</p>
    </div>
  );
}

// ============================================================
// 5. MANEJO DE ROLES EN FORMS Y COMPONENTES CONTROLADOS
// ============================================================

import { useState } from 'react';

function UserFormExample() {
  const [formData, setFormData] = useState({ nombre: '', rol: 'docente' });
  const { hasRole } = useAuth();

  // Solo admin puede cambiar el rol
  const canChangeRole = hasRole('admin');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Enviar al servidor...
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
      <div className="mb-4">
        <label className="block mb-2">Nombre</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Rol</label>
        <select
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          disabled={!canChangeRole}  {/* ← Solo si es admin */}
          className={`w-full border px-3 py-2 rounded ${
            !canChangeRole ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        >
          <option value="docente">Docente</option>
          <option value="vigilante">Vigilante</option>
          {canChangeRole && <option value="admin">Admin</option>}
        </select>
      </div>

      {!canChangeRole && (
        <p className="text-sm text-gray-500">
          Solo administradores pueden cambiar el rol
        </p>
      )}

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Guardar
      </button>
    </form>
  );
}

// ============================================================
// 6. ACTUALIZAR TOKEN CUANDO EL SERVIDOR LO PROPORCIONA
// ============================================================

import { useAuth } from '../context/AuthContext';

async function refreshTokenExample() {
  const { setAuthToken, logout } = useAuth();

  try {
    // El servidor devuelve un nuevo token
    const response = await fetch('/api/refresh-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      // Actualizar el contexto con el nuevo token
      setAuthToken(data.access_token, data.user);
      console.log('Token actualizado exitosamente');
    } else {
      // Si falla, hacer logout
      logout();
    }
  } catch (error) {
    console.error('Error al refrescar token:', error);
    logout();
  }
}

// ============================================================
// 7. INTERCEPTOR DE API CON AUTENTICACIÓN
// ============================================================

// En src/services/api.js

import { useAuth } from '../context/AuthContext';

export async function apiCall(endpoint, options = {}) {
  const { token, logout } = useAuth();

  // Si no hay token, redirigir al login
  if (!token) {
    logout();
    window.location.href = '/login';
    return;
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // Si el token expiró (401), hacer logout
  if (response.status === 401) {
    logout();
    window.location.href = '/login';
    throw new Error('Token expirado');
  }

  // Si no hay permisos (403), redirigir a acceso denegado
  if (response.status === 403) {
    window.location.href = '/access-denied';
    throw new Error('Acceso denegado');
  }

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return response.json();
}

// ============================================================
// 8. COMPONENTE DE PROTECCIÓN CONDICIONAL
// ============================================================

function ConditionalRenderExample() {
  const { hasRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Por favor inicia sesión primero</div>;
  }

  return (
    <div className="p-8">
      <h2>Bienvenido</h2>

      {/* Solo para admin */}
      {hasRole('admin') && (
        <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-600">
          <h3>Panel de Administración</h3>
          <ul>
            <li><a href="/users">Gestionar Usuarios</a></li>
            <li><a href="/roles">Gestionar Roles</a></li>
            <li><a href="/audit-log">Registro de Auditoría</a></li>
          </ul>
        </div>
      )}

      {/* Para docente y admin */}
      {hasRole(['admin', 'docente']) && (
        <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-600">
          <h3>Reportes y Análisis</h3>
          <ul>
            <li><a href="/reportes">Ver Reportes</a></li>
            <li><a href="/estadisticas">Estadísticas</a></li>
          </ul>
        </div>
      )}

      {/* Para vigilante */}
      {hasRole('vigilante') && (
        <div className="mt-4 p-4 bg-blue-100 border-l-4 border-blue-600">
          <h3>Monitoreo</h3>
          <ul>
            <li><a href="/scanners">Ver Escáneres</a></li>
            <li><a href="/alerts">Alertas Activas</a></li>
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 9. VERIFICACIÓN DE PERMISOS AVANZADA
// ============================================================

function AdvancedPermissionsExample() {
  const { userRole, user } = useAuth();

  // Definir permisos por rol
  const permissions = {
    admin: ['crear_usuario', 'editar_usuario', 'eliminar_usuario', 'ver_reportes', 'editar_configuracion'],
    docente: ['crear_calificacion', 'ver_reportes', 'editar_clases'],
    vigilante: ['ver_scanners', 'ver_alertas'],
  };

  // Función para verificar permisos
  const hasPermission = (permission) => {
    const rolePermissions = permissions[userRole] || [];
    return rolePermissions.includes(permission);
  };

  return (
    <div className="p-4">
      {/* Botón solo si tiene permiso */}
      {hasPermission('crear_usuario') && (
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          + Crear Usuario
        </button>
      )}

      {hasPermission('ver_reportes') && (
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Ver Reportes
        </button>
      )}

      {/* Mostrar permisos actuales */}
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3>Tus permisos:</h3>
        <ul>
          {permissions[userRole]?.map(perm => (
            <li key={perm} className="text-sm">✓ {perm}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export {
  NavbarExample,
  DashboardExample,
  JWTUtilitiesExample,
  UserFormExample,
  refreshTokenExample,
  apiCall,
  ConditionalRenderExample,
  AdvancedPermissionsExample,
};
