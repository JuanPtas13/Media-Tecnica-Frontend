import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";

/**
 * Contenedor principal para el panel administrativo
 * Contiene el layout y renderiza las sub-rutas
 */
export default function AdminPanel() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
