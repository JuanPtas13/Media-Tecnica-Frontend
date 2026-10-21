import { useState, useEffect } from "react";
import { useApiCall } from "../../hooks/useApiCall";

/**
 * Página de reportes del docente.
 * Permite consultar asistencia por grado, por estudiante y actividad general.
 */
export default function DocenteReportes() {
  // Tab activa entre los distintos tipos de reportes.
  const [activeTab, setActiveTab] = useState("grado");

  // Listas maestras para completar selectores.
  const [grados, setGrados] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);

  // Reporte por grado: filtros y resultados.
  const [gradoId, setGradoId] = useState("");
  const [fechaGrado, setFechaGrado] = useState("");
  const [reporteGrado, setReporteGrado] = useState(null);
  const [estudiantesGrado, setEstudiantesGrado] = useState([]);
  const [registrosFecha, setRegistrosFecha] = useState([]);

  // Reporte por estudiante: filtros y resultados.
  const [estudianteId, setEstudianteId] = useState("");
  const [fechaInicioEst, setFechaInicioEst] = useState("");
  const [fechaFinEst, setFechaFinEst] = useState("");
  const [reporteEstudiante, setReporteEstudiante] = useState(null);

  // Reporte general de actividad: rango de fechas y resumen.
  const [fechaInicioAct, setFechaInicioAct] = useState("");
  const [fechaFinAct, setFechaFinAct] = useState("");
  const [reporteActividad, setReporteActividad] = useState(null);
  const [reportError, setReportError] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // Servicios API para consultar grados, estudiantes y reportes.
  const { call: fetchGrados } = useApiCall();
  const { call: fetchEstudiantes } = useApiCall();
  const { call: fetchGrado, loading: loadingGrado } = useApiCall();
  const { call: fetchEstudiante, loading: loadingEstudiante } = useApiCall();
  const { call: fetchActividad, loading: loadingActividad } = useApiCall();
  const { call: fetchRegistrosFecha } = useApiCall();
  const { call: fetchEstudiantesGrado } = useApiCall();

  useEffect(() => {
    loadData();
  }, []);

  // Carga listas maestras para los selectores de grados y estudiantes.
  async function loadData() {
    try {
      const [gradosData, estudiantesData] = await Promise.all([
        fetchGrados("/grados/activos?limit=1000", { method: "GET" }),
        fetchEstudiantes("/estudiantes/activos?limit=1000", { method: "GET" }),
      ]);
      setGrados(Array.isArray(gradosData?.data) ? gradosData.data : []);
      setEstudiantes(Array.isArray(estudiantesData?.data) ? estudiantesData.data : []);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setReportError("No se pudieron cargar los grados y estudiantes para los reportes.");
    }
  }

  // Solicita resumen, estudiantes y registros para mostrar la asistencia del grado.
  async function buscarReporteGrado() {
    setReportError("");
    if (!gradoId || !fechaGrado) {
      setReportError("Selecciona un grado y una fecha para generar el reporte.");
      return;
    }

    try {
      setReportLoading(true);
      const [reporteData, estudiantesData, registrosData] = await Promise.all([
        fetchGrado(`/reportes/asistencia/grado/${gradoId}?fecha=${fechaGrado}`, { method: "GET" }),
        fetchEstudiantesGrado(`/estudiantes/grado/${gradoId}?limit=1000`, { method: "GET" }),
        fetchRegistrosFecha(`/registros/fecha/${fechaGrado}?limit=1000`, { method: "GET" }),
      ]);
      setReporteGrado(reporteData?.data || null);
      setEstudiantesGrado(
        Array.isArray(estudiantesData?.data)
          ? estudiantesData.data.filter((student) => student.estado)
          : []
      );
      setRegistrosFecha(Array.isArray(registrosData?.data) ? registrosData.data : []);
    } catch (error) {
      console.error("Error generando reporte por grado:", error);
      setReporteGrado(null);
      setReportError("No se pudo generar el reporte por grado. Revisa los filtros e inténtalo nuevamente.");
    } finally {
      setReportLoading(false);
    }
  }

  // Valida el rango y solicita el historial de un estudiante seleccionado.
  async function buscarReporteEstudiante() {
    setReportError("");
    if (!estudianteId || !fechaInicioEst || !fechaFinEst) {
      setReportError("Selecciona un estudiante y ambas fechas para generar el reporte.");
      return;
    }
    if (fechaInicioEst > fechaFinEst) {
      setReportError("La fecha inicial no puede ser posterior a la fecha final.");
      return;
    }
    try {
      setReportLoading(true);
      const data = await fetchEstudiante(`/reportes/asistencia/estudiante/${estudianteId}?fecha_inicio=${fechaInicioEst}&fecha_fin=${fechaFinEst}`, { method: "GET" });
      setReporteEstudiante(data?.data || null);
    } catch (error) {
      console.error("Error generando reporte por estudiante:", error);
      setReporteEstudiante(null);
      setReportError("No se pudo generar el reporte del estudiante. Inténtalo nuevamente.");
    } finally {
      setReportLoading(false);
    }
  }

  // Valida el rango de fechas y solicita el resumen y detalle de actividad.
  async function buscarReporteActividad() {
    setReportError("");
    if (!fechaInicioAct || !fechaFinAct) {
      setReportError("Selecciona ambas fechas para generar el reporte de actividad.");
      return;
    }
    if (fechaInicioAct > fechaFinAct) {
      setReportError("La fecha inicial no puede ser posterior a la fecha final.");
      return;
    }
    try {
      setReportLoading(true);
      const data = await fetchActividad(`/reportes/actividad?fecha_inicio=${fechaInicioAct}&fecha_fin=${fechaFinAct}`, { method: "GET" });
      setReporteActividad(data?.data || null);
    } catch (error) {
      console.error("Error generando reporte de actividad:", error);
      setReporteActividad(null);
      setReportError("No se pudo generar el reporte de actividad. Inténtalo nuevamente.");
    } finally {
      setReportLoading(false);
    }
  }

  // Cruza cada estudiante con su registro; sin registro queda pendiente o ausente
  // según si la hora de cierre ya confirmó la asistencia.
  function getEstadoEstudiante(estudianteId) {
    const registro = registrosFecha.find(r => r.estudiante_id === estudianteId);
    if (registro) return registro.estado;
    return reporteGrado?.asistencia_cerrada ? "ausente" : "pendiente";
  }

  const tabs = [
    { key: "grado", label: "📚 Por Grado" },
    { key: "estudiante", label: "👤 Por Estudiante" },
    { key: "actividad", label: "📈 Actividad General" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-600 mt-1">Genera reportes de asistencia</p>
      </div>

      {reportError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {reportError}
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reporte por Grado */}
      {activeTab === "grado" && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Asistencia por Grado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
                <select
                  value={gradoId}
                  onChange={(e) => setGradoId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar grado...</option>
                  {grados.map((g) => (
                    <option key={g.id_grado} value={g.id_grado}>
                      {g.numero_grado} - {g.grupo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={fechaGrado}
                  onChange={(e) => setFechaGrado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            {/* Cambia bg-green-500 y hover:bg-green-600 para editar el color de este botón. */}
            <button
              onClick={buscarReporteGrado}
              disabled={loadingGrado || reportLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
            >
              {loadingGrado || reportLoading ? "Cargando..." : "Generar Reporte"}
            </button>
          </div>

          {reporteGrado && (
            <div className="space-y-4">
              {/* Resumen */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Resumen</h3>
                {!reporteGrado.asistencia_cerrada && (
                  <p className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                    La asistencia aún no está cerrada
                    {reporteGrado.hora_cierre_asistencia
                      ? `; las ausencias se confirmarán después de las ${String(reporteGrado.hora_cierre_asistencia).slice(0, 5)}.`
                      : "; no hay una configuración horaria vigente para determinar ausencias."}
                  </p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{reporteGrado.total_estudiantes}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{reporteGrado.presentes}</p>
                    <p className="text-sm text-gray-600">Presentes</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{reporteGrado.ausentes}</p>
                    <p className="text-sm text-gray-600">Ausentes</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{reporteGrado.porcentaje_asistencia?.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Asistencia</p>
                  </div>
                </div>
              </div>

              {/* ✅ Tabla de estudiantes con estado */}
              {estudiantesGrado.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Detalle por Estudiante</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Estudiante</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Documento</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estudiantesGrado.map((est) => {
                          const estado = getEstadoEstudiante(est.id_estudiante);
                          return (
                            <tr key={est.id_estudiante} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-2">{est.nombre} {est.apellido1} {est.apellido2}</td>
                              <td className="px-4 py-2 text-gray-500">{est.documento}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  estado === "a tiempo" ? "bg-green-100 text-green-700" :
                                  estado === "tarde" ? "bg-yellow-100 text-yellow-700" :
                                  estado === "ausente" ? "bg-red-100 text-red-700" :
                                  "bg-gray-100 text-gray-700"
                                }`}>
                                  {estado === "pendiente" ? "Pendiente" : estado}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reporte por Estudiante */}
      {activeTab === "estudiante" && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Asistencia por Estudiante</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
                <select
                  value={estudianteId}
                  onChange={(e) => setEstudianteId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar estudiante...</option>
                  {estudiantes.map((e) => (
                    <option key={e.id_estudiante} value={e.id_estudiante}>
                      {e.nombre} {e.apellido1} {e.apellido2}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  value={fechaInicioEst}
                  onChange={(e) => setFechaInicioEst(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  value={fechaFinEst}
                  onChange={(e) => setFechaFinEst(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <button
              onClick={buscarReporteEstudiante}
              disabled={loadingEstudiante || reportLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
            >
              {loadingEstudiante || reportLoading ? "Cargando..." : "Generar Reporte"}
            </button>
          </div>

          {reporteEstudiante && (
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Resultado</h3>
              <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                Se muestran los registros de ingreso existentes. Las ausencias se confirman en el reporte por grado después de la hora de cierre; para calcularlas por estudiante se necesita un calendario de jornadas escolares.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{reporteEstudiante.total_registros}</p>
                  <p className="text-sm text-gray-600">Total Registros</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{reporteEstudiante.entradas}</p>
                  <p className="text-sm text-gray-600">Entradas</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Periodo</p>
                  <p className="text-sm font-medium text-gray-900">
                    {reporteEstudiante.fecha_inicio} → {reporteEstudiante.fecha_fin}
                  </p>
                </div>
              </div>

              {reporteEstudiante.registros?.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Fecha</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Hora</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Estado</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Min. Retraso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporteEstudiante.registros.map((r) => (
                        <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2">{new Date(r.fecha + "T00:00:00").toLocaleDateString("es-ES")}</td>
                          <td className="px-4 py-2">{r.hora?.slice(0, 5)}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              r.estado === "a tiempo" ? "bg-green-100 text-green-700" :
                              r.estado === "tarde" ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {r.estado}
                            </span>
                          </td>
                          <td className="px-4 py-2">{r.min_retraso ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reporte Actividad */}
      {activeTab === "actividad" && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Actividad General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  value={fechaInicioAct}
                  onChange={(e) => setFechaInicioAct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  value={fechaFinAct}
                  onChange={(e) => setFechaFinAct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <button
              onClick={buscarReporteActividad}
              disabled={loadingActividad || reportLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
            >
              {loadingActividad || reportLoading ? "Cargando..." : "Generar Reporte"}
            </button>
          </div>

          {reporteActividad && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Resultado</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{reporteActividad.total_registros}</p>
                  <p className="text-sm text-gray-600">Total Registros</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{reporteActividad.total_entradas}</p>
                  <p className="text-sm text-gray-600">Total Entradas</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Periodo: {reporteActividad.fecha_inicio} → {reporteActividad.fecha_fin}
              </p>
              {reporteActividad.registros?.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Fecha</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Hora</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Estudiante</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Documento</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Estado</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Min. Retraso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporteActividad.registros.map((registro) => (
                        <tr key={registro.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-2">{new Date(`${registro.fecha}T00:00:00`).toLocaleDateString("es-ES")}</td>
                          <td className="px-4 py-2">{registro.hora?.slice(0, 5)}</td>
                          <td className="px-4 py-2">{registro.estudiante}</td>
                          <td className="px-4 py-2 text-gray-500">{registro.documento}</td>
                          <td className="px-4 py-2">{registro.estado}</td>
                          <td className="px-4 py-2">{registro.min_retraso ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {reporteActividad.registros?.length === 0 && (
                <p className="mt-6 text-center text-sm text-gray-500">
                  No hay registros de ingreso en el periodo seleccionado.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}