import { Outlet } from "react-router-dom";
import DocenteLayout from "../../components/layout/DocenteLayout";

export default function DocentePanel() {
  return (
    <DocenteLayout>
      <Outlet />
    </DocenteLayout>
  );
}