/**
 * Hook para exportar datos a CSV
 */
export function useExportCSV() {
  const exportToCSV = (data, filename = "export.csv") => {
    if (!data || data.length === 0) {
      console.warn("No data to export");
      return;
    }

    // Obtener cabeceras del primer objeto
    const headers = Object.keys(data[0]);

    // Crear contenido CSV
    let csv = headers.join(",") + "\n";

    data.forEach((item) => {
      const values = headers.map((header) => {
        const value = item[header];
        // Escapar valores con comas o comillas
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || "";
      });
      csv += values.join(",") + "\n";
    });

    // Crear blob y descargar
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data, filename = "export.json") => {
    if (!data) {
      console.warn("No data to export");
      return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    exportToCSV,
    exportToJSON,
  };
}
