import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "./utils/toast";
import Login from "./pages/auth/Login";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ProtectedRoute from "./routes/Protectedrute";
import AdminPanel from "./pages/AdminPanel";
import AdminDashboard from "./pages/AdminDashboard";
import EstudiantesPage from "./pages/admin/Estudiantes";
import UsuariosPage from "./pages/admin/Usuarios";
import RegistrosPage from "./pages/admin/Registros";
import GradosPage from "./pages/admin/Grados";
import RolesPage from "./pages/admin/Roles";
import ConfiguracionPage from "./pages/admin/Configuracion";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* ============== RUTAS PÚBLICAS ============== */}
          <Route path="/login" element={<Login />} />
          <Route path="/access-denied" element={<UnauthorizedPage />} />

          {/* ============== RUTAS PROTEGIDAS POR ROL ============== */}

          {/* ADMIN - Panel completo de administración */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin" showAccessDenied>
                <AdminPanel />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="estudiantes" element={<EstudiantesPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="registros" element={<RegistrosPage />} />
            <Route path="grados" element={<GradosPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="configuracion" element={<ConfiguracionPage />} />
          </Route>

          {/* DOCENTE - Solo para usuarios con rol 'docente' */}
          <Route
            path="/docente/*"
            element={
              <ProtectedRoute requiredRole="docente" showAccessDenied>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Panel de Docente</h1>
                  <p>Bienvenido al dashboard de docente</p>
                  <div className="mt-4 p-4 bg-green-100 rounded">
                    <p>Solo los docentes pueden ver esta página.</p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* VIGILANTE - Solo para usuarios con rol 'vigilante' */}
          <Route
            path="/vigilante/*"
            element={
              <ProtectedRoute requiredRole="vigilante" showAccessDenied>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Panel de Vigilante</h1>
                  <p>Bienvenido al dashboard de vigilante</p>
                  <div className="mt-4 p-4 bg-purple-100 rounded">
                    <p>Solo los vigilantes pueden ver esta página.</p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* ============== RUTAS POR DEFECTO ============== */}
          {/* Redirección de inicio a login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Ruta 404 */}
          <Route
            path="*"
            element={
              <div className="p-8 text-center">
                <h1 className="text-3xl font-bold text-red-600">404</h1>
                <p>Página no encontrada</p>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
