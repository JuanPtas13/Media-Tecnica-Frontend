import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApiCall } from "../../hooks/useApiCall";

/**
 * Pantalla para registrar la llegada de un estudiante al colegio.
 * El vigilante escanea o escribe el documento y el sistema determina si llegó a tiempo o tarde.
 */
export default function RegistrarIngreso() {
  // Usuario autenticado que realiza el registro.
  const { user } = useAuth();

  // Documento del estudiante que se va a registrar.
  const [documento, setDocumento] = useState("");

  // Configuración horaria vigente que define el límite y la tolerancia.
  const [config, setConfig] = useState(null);

  // Resultado del registro para mostrar mensaje visual final.
  const [resultado, setResultado] = useState(null);

  // Error por si el estudiante no existe o hay algún problema.
  const [error, setError] = useState(null);

  // Indica si el sistema está procesando el ingreso.
  const [procesando, setProcesando] = useState(false);

  // Referencia para mantener el foco en el input cada vez que se limpia la pantalla.
  const inputRef = useRef(null);

  // Endpoints reutilizables para buscar estudiante, cargar config y crear registros.
  const { call: buscarEstudiante } = useApiCall();
  const { call: obtenerConfig } = useApiCall();
  const { call: crearRegistro } = useApiCall();

  useEffect(() => {
    cargarConfig();
    inputRef.current?.focus();
  }, []);

  // Mantiene el foco en el campo para facilitar el escaneo contínuo.
  useEffect(() => {
    const interval = setInterval(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Carga la configuración horaria vigente del día o periodo activo.
  async function cargarConfig() {
    try {
      const data = await obtenerConfig("/config-horarios/vigente", { method: "GET" });
      setConfig(data?.data || null);
    } catch (error) {
      console.error("Error cargando config:", error);
    }
  }

  // Decide si el ingreso fue a tiempo o tarde según la hora límite.
  function calcularEstado(config) {
    const ahora = new Date();
    const [h, m] = config.hora_limite_ingreso.split(":").map(Number);
    const limiteMinutos = h * 60 + m;
    const ahoraMinutos = ahora.getHours() * 60 + ahora.getMinutes();
    return ahoraMinutos <= limiteMinutos ? "a tiempo" : "tarde";
  }

  // Calcula los minutos de retraso respecto al inicio de clase.
  function calcularMinRetraso(config) {
    const ahora = new Date();
    const [h, m] = config.hora_inicio_clase.split(":").map(Number);
    const inicioMinutos = h * 60 + m;
    const ahoraMinutos = ahora.getHours() * 60 + ahora.getMinutes();
    return Math.max(0, ahoraMinutos - inicioMinutos);
  }

  // Procesa el documento escaneado y registra la asistencia automáticamente.
  async function handleScan(e) {
    e.preventDefault();
    if (!documento.trim() || procesando) return;

    setError(null);
    setResultado(null);
    setProcesando(true);

    try {
      // Paso 1: buscar estudiante
      const estudianteData = await buscarEstudiante(
        `/estudiantes/documento/${documento.trim()}`,
        { method: "GET" }
      );
      const estudiante = estudianteData?.data;

      if (!estudiante) {
        setError("Estudiante no encontrado.");
        setDocumento("");
        setProcesando(false);
        return;
      }

      if (!config) {
        setError("No hay configuración horaria vigente.");
        setDocumento("");
        setProcesando(false);
        return;
      }

      // Paso 2: calcular estado automáticamente
      const ahora = new Date();
      const fecha = ahora.toISOString().split("T")[0];
      const hora = ahora.toTimeString().split(" ")[0];
      const estado = calcularEstado(config);
      const minRetraso = calcularMinRetraso(config);

      // Paso 3: crear registro
      await crearRegistro("/registros/", {
        method: "POST",
        body: JSON.stringify({
          estudiante_id: estudiante.id_estudiante,
          usuario_id: user.id,
          config_id: config.id,
          fecha,
          hora,
          estado,
          min_retraso: minRetraso,
        }),
      });

      // Paso 4: mostrar resultado
      setResultado({
        nombre: `${estudiante.nombre} ${estudiante.apellido1}`,
        estado,
        hora: hora.slice(0, 5),
      });

      // ✅ Limpiar después de 3 segundos automáticamente
      setTimeout(() => {
        setResultado(null);
        setDocumento("");
        inputRef.current?.focus();
      }, 3000);

    } catch (err) {
      setError("Error al procesar el ingreso. Intenta de nuevo.");
      setDocumento("");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Control de Ingreso</h1>
        <p className="text-gray-600 mt-1">Escanea el carnet del estudiante</p>
      </div>

      {/* Config vigente */}
      {config && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          ⏰ Inicio: <strong>{config.hora_inicio_clase?.slice(0, 5)}</strong> —
          Límite: <strong>{config.hora_limite_ingreso?.slice(0, 5)}</strong> —
          Tolerancia: <strong>{config.min_tolerancia} min</strong>
        </div>
      )}

      {!config && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          ⚠️ No hay configuración horaria vigente.
        </div>
      )}

      {/* Input oculto para el scanner */}
      <form onSubmit={handleScan}>
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="text-center space-y-3">
            <div className="text-6xl">
              {procesando ? "⏳" : resultado ? (resultado.estado === "a tiempo" ? "✅" : "⏰") : "📷"}
            </div>
            <p className="text-gray-600 font-medium">
              {procesando ? "Procesando..." : "Listo para escanear"}
            </p>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            placeholder="Escanea o digita el documento..."
            disabled={procesando}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          />

          <button
            type="submit"
            disabled={procesando || !documento.trim() || !config}
            className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 font-semibold"
          >
            {procesando ? "Procesando..." : "Registrar (Enter)"}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
          ❌ {error}
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div className={`border-2 rounded-lg p-6 text-center space-y-2 ${
          resultado.estado === "a tiempo"
            ? "bg-green-50 border-green-300"
            : "bg-yellow-50 border-yellow-300"
        }`}>
          <div className="text-5xl">
            {resultado.estado === "a tiempo" ? "✅" : "⏰"}
          </div>
          <h3 className={`text-xl font-bold ${
            resultado.estado === "a tiempo" ? "text-green-800" : "text-yellow-800"
          }`}>
            {resultado.estado === "a tiempo" ? "Ingreso a tiempo" : "Ingreso tarde"}
          </h3>
          <p className="font-semibold text-gray-900 text-lg">{resultado.nombre}</p>
          <p className="text-gray-600">Hora: <strong>{resultado.hora}</strong></p>
          <p className="text-xs text-gray-400 mt-2">Se cerrará automáticamente en 3 segundos...</p>
        </div>
      )}
    </div>
  );
}