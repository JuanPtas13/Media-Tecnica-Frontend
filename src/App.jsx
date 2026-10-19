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
import DocentePanel from "./pages/docente/DocentePanel";
import DocenteDashboard from "./pages/docente/DocenteDashboard";
import DocenteRegistros from "./pages/docente/Registros";
import DocenteReportes from "./pages/docente/Reportes";
import VigilantePanel from "./pages/vigilante/VigilantePanel";
import VigilanteDashboard from "./pages/vigilante/VigilanteDashboard";
import RegistrarIngreso from "./pages/vigilante/RegistrarIngreso";

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
                <DocentePanel />
              </ProtectedRoute>
            }
          >
            <Route index element={<DocenteDashboard />} />
            <Route path="dashboard" element={<DocenteDashboard />} />
            <Route path="registros" element={<DocenteRegistros />} />
            <Route path="reportes" element={<DocenteReportes />} />
          </Route>
          

          {/* VIGILANTE - Solo para usuarios con rol 'vigilante' */}
          <Route
            path="/vigilante/*"
            element={
              <ProtectedRoute requiredRole="vigilante" showAccessDenied>
                <VigilantePanel />
              </ProtectedRoute>
            }
          >
            <Route index element={<VigilanteDashboard />} />
            <Route path="dashboard" element={<VigilanteDashboard />} />
            <Route path="registrar" element={<RegistrarIngreso />} />
          </Route>

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
