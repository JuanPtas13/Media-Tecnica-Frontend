/**
 * Script de Testing Automatizado
 * Ejecutar: node test-api.js
 * 
 * Valida:
 * - Endpoints de API disponibles
 * - Estructura de datos
 * - Autenticación JWT
 */

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
const TEST_EMAIL = "admin@test.com";
const TEST_PASSWORD = "admin123";

let token = null;

const tests = {
  passed: 0,
  failed: 0,
  errors: [],
};

async function apiCall(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();

  return { status: response.status, data };
}

async function test(name, fn) {
  try {
    await fn();
    tests.passed++;
    console.log(`✅ ${name}`);
  } catch (error) {
    tests.failed++;
    tests.errors.push({ test: name, error: error.message });
    console.error(`❌ ${name}: ${error.message}`);
  }
}

async function runTests() {
  console.log("🧪 Iniciando tests automatizados...\n");

  // 1. Test de Login
  await test("Login con credenciales válidas", async () => {
    const { status, data } = await apiCall("/login", "POST", {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (status !== 200) throw new Error(`Status ${status}`);
    if (!data.access_token) throw new Error("No access_token en respuesta");

    token = data.access_token;
    console.log(`   Token: ${token.substring(0, 20)}...`);
  });

  // 2. Test de Endpoints de Estudiantes
  await test("GET /Estudiantes - Listar estudiantes", async () => {
    const { status } = await apiCall("/Estudiantes");
    if (status !== 200) throw new Error(`Status ${status}`);
  });

  await test("GET /Estudiantes/activos - Estudiantes activos", async () => {
    const { status } = await apiCall("/Estudiantes/activos");
    if (status !== 200) throw new Error(`Status ${status}`);
  });

  // 3. Test de Endpoints de Usuarios
  await test("GET /usuarios - Listar usuarios", async () => {
    const { status } = await apiCall("/usuarios");
    if (status !== 200) throw new Error(`Status ${status}`);
  });

  // 4. Test de Endpoints de Grados
  await test("GET /grados - Listar grados", async () => {
    const { status } = await apiCall("/grados");
    if (status !== 200) throw new Error(`Status ${status}`);
  });

  // 5. Test de Endpoints de Roles
  await test("GET /roles - Listar roles", async () => {
    const { status } = await apiCall("/roles");
    if (status !== 200) throw new Error(`Status ${status}`);
  });

  // 6. Test de Endpoints de Registros
  await test("GET /registros - Listar registros", async () => {
    const { status } = await apiCall("/registros");
    if (status !== 200) throw new Error(`Status ${status}`);
  });

  // 7. Test de Validación de Token Expirado
  await test("Rechaza token inválido", async () => {
    const savedToken = token;
    token = "invalid_token";

    const { status } = await apiCall("/Estudiantes");
    if (status === 401 || status === 403) {
      token = savedToken;
      return; // Success
    }

    throw new Error("Debería rechazar token inválido");
  });

  // Resumen
  console.log("\n" + "=".repeat(50));
  console.log(`📊 RESULTADOS: ${tests.passed} ✅ | ${tests.failed} ❌`);
  console.log("=".repeat(50));

  if (tests.errors.length > 0) {
    console.log("\n❌ Errores detectados:");
    tests.errors.forEach((err) => {
      console.log(`  - ${err.test}: ${err.error}`);
    });
  } else {
    console.log("\n🎉 ¡Todos los tests pasaron!");
  }

  return tests.failed === 0;
}

// Ejecutar
runTests()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error("Error ejecutando tests:", error);
    process.exit(1);
  });
