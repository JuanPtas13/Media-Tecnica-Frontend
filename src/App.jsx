import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ProtectedRoute from "./routes/Protectedrute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ============== RUTAS PÚBLICAS ============== */}
          <Route path="/login" element={<Login />} />
          <Route path="/access-denied" element={<UnauthorizedPage />} />

          {/* ============== RUTAS PROTEGIDAS POR ROL ============== */}

          {/* ADMIN - Solo para usuarios con rol 'admin' */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin" showAccessDenied>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Panel de Administrador</h1>
                  <p>Bienvenido al dashboard de administrador</p>
                  <div className="mt-4 p-4 bg-blue-100 rounded">
                    <p>Solo los administradores pueden ver esta página.</p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

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

          {/* EJEMPLO: Ruta que acepta múltiples roles */}
          {/* 
          <Route
            path="/reportes"
            element={
              <ProtectedRoute 
                requiredRole={['admin', 'docente']} 
                showAccessDenied
              >
                <div className="p-8">
                  <h1>Reportes</h1>
                  <p>Solo admin y docente pueden ver reportes</p>
                </div>
              </ProtectedRoute>
            }
          />
          */}

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
