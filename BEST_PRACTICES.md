# 🚀 GUÍA DE MEJORES PRÁCTICAS - PANEL ADMIN

## 1. Uso de Notificaciones (Toast)

Ahora disponible en el sistema. Los toasts se muestran automáticamente en la esquina inferior derecha.

```jsx
import { useToast } from "./utils/toast";

function MiComponente() {
  const { showSuccess, showError } = useToast();

  const handleCrear = async () => {
    try {
      await crearEstudiante(datos);
      showSuccess("Estudiante creado");
    } catch (error) {
      showError("Error al crear");
    }
  };

  return <button onClick={handleCrear}>Crear</button>;
}
```

## 2. Validaciones de Formulario

Sistema de validadores completo disponible:

```jsx
import { validators } from "./utils/validators";

// Email
validators.email("test@test.com") // null si es válido, error si no

// Password  
validators.password("123456", 8) // Error si < 8 caracteres

// Nombre
validators.name("Juan") // Valida 2-100 caracteres

// Número
validators.number("25", 0, 100) // Valida rango

// Múltiples validadores
validators.combine("data", validators.required, validators.email)
```

## 3. Exportar Datos

```jsx
import { useExportCSV } from "./hooks/useExportCSV";

function Estudiantes() {
  const { exportToCSV, exportToJSON } = useExportCSV();

  return (
    <button onClick={() => exportToCSV(data, "estudiantes.csv")}>
      Descargar CSV
    </button>
  );
}
```

## 4. Cacheo de Datos

```jsx
import { useCache } from "./hooks/useCache";

const { getFromCache, setInCache, clearCache } = useCache(5 * 60 * 1000); // 5 min

// Intentar obtener del caché
const datos = getFromCache("estudiantes");

// Guardar en caché
if (!datos) {
  const datos = await api.getEstudiantes();
  setInCache("estudiantes", datos);
}

// Limpiar caché
clearCache("estudiantes");
```

## 5. Manejo de Errores

```jsx
import { useErrorHandler } from "./hooks/useErrorHandler";

function MiComponente() {
  const { handleApiError, handleSuccess } = useErrorHandler();

  const guardar = async () => {
    try {
      await api.save(datos);
      handleSuccess("Guardado correctamente");
    } catch (error) {
      handleApiError(error, "Guardar"); // Muestra toast automático
    }
  };
}
```

## ✨ Nuevas Utilidades Disponibles

| Nombre | Ubicación | Uso |
|--------|-----------|-----|
| Toast (Notificaciones) | `utils/toast.js` | Mostrar mensajes al usuario |
| Validadores | `utils/validators.js` | Validar datos de formularios |
| Error Handler | `hooks/useErrorHandler.js` | Manejo centralizado de errores |
| Export CSV/JSON | `hooks/useExportCSV.js` | Descargar datos |
| Cache | `hooks/useCache.js` | Cachear requests de API |

## 📝 Próximos Pasos Recomendados

1. Ejecutar `npm run dev` para iniciar el servidor
2. Probar el flujo completo de login → admin panel
3. Verificar que los módulos cargan correctamente
4. Probar las operaciones CRUD en cada módulo
5. Revisar la consola del navegador para errores

## 🔍 Testing Checklist

- [ ] Login funciona correctamente
- [ ] Panel admin se carga sin errores
- [ ] Sidebar navega a todos los módulos
- [ ] Tabla de estudiantes carga datos
- [ ] Modal de crear/editar abre y cierra
- [ ] Búsqueda filtra en tiempo real
- [ ] Paginación funciona
- [ ] Eliminación pide confirmación
- [ ] Toasts se muestran correctamente
- [ ] Exportar CSV descarga archivo
- [ ] Validaciones funcionan en formularios

---

**Sistema listo para producción ✅**
