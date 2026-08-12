import { Outlet } from "react-router-dom";
import VigilanteLayout from "../../components/layout/VigilanteLayout";

/**
 * Contenedor principal del área del vigilante.
 * Mantiene el layout y renderiza la vista de ingreso o panel activo.
 */
export default function VigilantePanel() {
  return (
    <VigilanteLayout>
      {/* Outlet renderiza la página hija del vigilante según la ruta actual. */}
      <Outlet />
    </VigilanteLayout>
  );
}