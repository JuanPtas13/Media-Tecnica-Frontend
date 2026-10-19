import { Outlet } from "react-router-dom";
import DocenteLayout from "../../components/layout/DocenteLayout";

/**
 * Contenedor principal del área docente.
 * Mantiene el layout general del panel docente y renderiza la vista hija activa.
 */
export default function DocentePanel() {
  return (
    <DocenteLayout>
      {/* Outlet permite mostrar la subruta actual, por ejemplo reportes o registros. */}
      <Outlet />
    </DocenteLayout>
  );
}