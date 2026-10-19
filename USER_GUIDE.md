# 📖 MANUAL DE USO - Panel Administrativo v1.0.1

## 🎯 Inicio Rápido (5 minutos)

### Paso 1: Instalar dependencias
```bash
cd Media-Tecnica-Frontend
npm install
```

### Paso 2: Configurar variables de entorno
Crear archivo `.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_TIMEOUT=30000
```

### Paso 3: Verificar backend
```bash
# El backend debe estar corriendo en http://localhost:8000
curl http://localhost:8000/health  # O verificar manualmente
```

### Paso 4: Iniciar frontend
```bash
npm run dev
```

### Paso 5: Acceder
- URL: http://localhost:5173
- Email: admin@test.com
- Password: admin123

---

## 🔐 Autenticación

### Flujo de Login
1. Ingresar email y contraseña
2. Click en "Iniciar Sesión"
3. API valida credenciales
4. Si es correcto → Guarda token JWT + datos usuario
5. Redirige según rol (admin → /admin)

### Token JWT
- Se guarda en `localStorage` bajo la clave `token`
- Se envía automáticamente en header `Authorization: Bearer <token>`
- Expira según configuración del backend

### Logout
- Click en avatar/usuario en navbar
- Click en "Cerrar sesión"
- Token se elimina
- Redirige a login

---

## 📚 Módulos

### 1. Estudiantes
**Ubicación:** Sidebar → Estudiantes

**Acciones:**
- ✅ Ver lista de estudiantes
- ✅ Crear nuevo estudiante
- ✅ Editar existente
- ✅ Eliminar
- ✅ Buscar por nombre
- ✅ Filtrar por grado
- ✅ Ver solo activos

**Campos:**
- Nombre (requerido)
- Apellido (requerido)
- Email (requerido, único)
- Grado (seleccionar)
- Estado (Activo/Inactivo)

### 2. Usuarios
**Ubicación:** Sidebar → Usuarios

**Acciones:**
- ✅ Ver usuarios del sistema
- ✅ Crear usuario
- ✅ Editar
- ✅ Eliminar
- ✅ Asignar roles

**Campos:**
- Nombre
- Email (único)
- Rol (Admin, Docente, Vigilante)
- Estado

### 3. Registros (Asistencia)
**Ubicación:** Sidebar → Registros

**Acciones:**
- ✅ Ver historial de asistencia
- ✅ Crear registro manual
- ✅ Filtrar por:
  - Fecha
  - Estudiante
  - Usuario
  - Estado
- ✅ Ver últimos registros

**Vista:** Timeline/Historial

### 4. Grados
**Ubicación:** Sidebar → Grados

**Acciones:**
- ✅ Ver grados disponibles
- ✅ Crear grado
- ✅ Editar
- ✅ Eliminar
- ✅ Gestionar grupos

**Campos:**
- Nombre grado
- Número
- Descripción
- Estado

### 5. Roles
**Ubicación:** Sidebar → Roles

**Acciones:**
- ✅ Ver roles disponibles
- ✅ Crear rol personalizado
- ✅ Editar permisos
- ✅ Asignar a usuarios

**Permisos disponibles:**
- Ver estudiantes
- Crear estudiantes
- Editar estudiantes
- Eliminar estudiantes
- Y más...

### 6. Configuración Horaria
**Ubicación:** Sidebar → Configuración

**Acciones:**
- ✅ Ver horarios actuales
- ✅ Configurar horario de entrada
- ✅ Establecer tolerancia (minutos)
- ✅ Definir vigencia (fecha inicio/fin)

---

## 🔍 Características por Módulo

### Búsqueda
- Disponible en: Estudiantes, Usuarios, Roles
- Busca en tiempo real al escribir
- Búsqueda es débounced (no hace request por cada tecla)

### Filtros
- Filtros específicos por módulo
- Ejemplo: Estudiantes → Filtrar por grado
- Ejemplo: Registros → Filtrar por fecha

### Paginación
- Mostrada en tabla
- 10 items por página
- Botones: Anterior, Siguiente, números

### Ordenamiento
- Click en encabezado de columna
- Alterna entre ascendente/descendente
- Indicador visual del orden actual

---

## 💾 Operaciones CRUD

### Crear (Create)
1. Click en botón "Crear" o "+"
2. Se abre modal con formulario
3. Completar campos
4. Click en "Guardar"
5. Si es exitoso → Toast verde + actualiza tabla
6. Si hay error → Toast rojo con detalles

### Leer (Read)
- Los datos se cargan automáticamente
- Se muestran en tabla o tarjetas
- Se cachean por 5 minutos

### Actualizar (Update)
1. Click en ícono "Editar" o fila
2. Se abre modal con datos pre-llenados
3. Modificar campos
4. Click en "Guardar"
5. Si es exitoso → Tabla se actualiza

### Eliminar (Delete)
1. Click en ícono "Eliminar" (🗑️)
2. Se abre modal de confirmación
3. Click en "Confirmar"
4. Se elimina y tabla se actualiza
5. Toast con confirmación

---

## 🎨 Interfaz

### Navbar (Arriba)
- Logo del sistema
- Título del módulo actual
- Avatar del usuario con dropdown
- Opción de logout

### Sidebar (Izquierda)
- Logo/Nombre del app
- Menú de navegación
- En mobile: Colapsable
- Módulos disponibles según rol

### Main Content (Centro)
- Título y descripción
- Botones de acción
- Tabla o cards con datos
- Paginación

### Footer (Abajo)
- Información de copyright
- Links útiles

---

## 🎁 Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| `Escape` | Cerrar modal |
| `Enter` | Enviar formulario |
| `Ctrl + F` | Buscar (navegador) |
| `Ctrl + P` | Imprimir |

---

## 📊 Exportar Datos

### CSV
1. Click en botón "Descargar CSV"
2. Se descarga archivo `.csv`
3. Abre en Excel o Google Sheets

### JSON
1. Click en botón "Descargar JSON"
2. Se descarga archivo `.json`
3. Útil para backup o integración

---

## ⚠️ Mensajes de Error Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Credenciales incorrectas" | Email/password incorrecto | Verificar datos |
| "No tienes permiso" | Rol insuficiente | Contactar admin |
| "Recurso no encontrado" | Item eliminado | Actualizar página |
| "Conexión perdida" | API no disponible | Verificar backend |
| "Email ya existe" | Duplicado | Usar otro email |

---

## 🧪 Testing

### Validación Manual
1. ✅ Login funciona
2. ✅ Puedo acceder a /admin
3. ✅ Sidebar muestra todos módulos
4. ✅ Puedo crear un estudiante
5. ✅ Busca filtra en tiempo real
6. ✅ Puedo editar estudiante
7. ✅ Puedo eliminar con confirmación
8. ✅ Paginación funciona
9. ✅ Exportar CSV/JSON descarga
10. ✅ Toast se muestra en acciones

### Script Automatizado
```bash
node test-api.js
```

---

## 🔧 Configuración Avanzada

### Cambiar duración de caché
```jsx
// En componente
const { data } = useCachedApiCall(10 * 60 * 1000); // 10 minutos
```

### Cambiar debounce de búsqueda
```jsx
const debouncedValue = useDebounce(searchTerm, 1000); // 1 segundo
```

### Cambiar items por página
```jsx
const { paginatedItems } = usePagination(items, 20); // 20 items
```

---

## 📱 Compatibilidad

✅ **Desktop:** Chrome, Firefox, Safari, Edge  
✅ **Tablet:** iPad, Android tablets  
✅ **Mobile:** iPhone, Android phones  

**Nota:** Mejor experiencia en desktop (800px+)

---

## 🚀 Performance Tips

1. **Cacheo:** Datos se cachean 5 minutos automáticamente
2. **Debounce:** Búsqueda usa debounce para evitar overload
3. **Lazy Load:** Imágenes cargan bajo demanda
4. **Skeleton:** Placeholders mientras carga

---

## 📞 Soporte

**Documentación:**
- `README_ADMIN.md` - Documentación completa
- `BEST_PRACTICES.md` - Mejores prácticas
- `UPDATE_SUMMARY.md` - Cambios recientes

**Debug:**
- Abrir DevTools: F12
- Network → Ver requests
- Console → Ver errores
- LocalStorage → Ver token

---

**¡Listo para usar! Cualquier duda consulta la documentación. 📚**
