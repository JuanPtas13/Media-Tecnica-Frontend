import { Outlet } from "react-router-dom";
import VigilanteLayout from "../../components/layout/VigilanteLayout";

export default function VigilantePanel() {
  return (
    <VigilanteLayout>
      <Outlet />
    </VigilanteLayout>
  );
}