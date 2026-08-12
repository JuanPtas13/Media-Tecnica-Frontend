import { Outlet } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";

/**
 * Este componente actúa como contenedor principal del área administrativa.
 * Sirve para mantener el mismo diseño de la vista de administración y
 * renderizar la página hija según la ruta activa.
 */
export default function AdminPanel() {
  return (
    <AdminLayout>
      {/* Outlet permite mostrar el contenido correspondiente a la subruta actual,
          por ejemplo: /admin/usuarios, /admin/estudiantes, etc. */}
      <Outlet />
    </AdminLayout>
  );
}
