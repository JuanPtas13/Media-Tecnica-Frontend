/**
 * HERRAMIENTA DE PRUEBA - Verificar JWT y Rol
 * 
 * Copia este código en la consola del navegador (DevTools > Console)
 * después de hacer login para ver qué contiene tu token JWT.
 */

function testJWT() {
  // Obtener el token del localStorage
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  console.log("========== TEST JWT ==========\n");

  if (!token) {
    console.error("❌ No hay token en localStorage");
    return;
  }

  console.log("✅ Token encontrado");

  // Decodificar el JWT
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("❌ Token no tiene 3 partes (inválido)");
      return;
    }

    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const payloadObj = JSON.parse(decodedPayload);

    console.log("📋 Payload del JWT:");
    console.table(payloadObj);

    // Verificar campos importantes
    console.log("\n🔍 Verificaciones:");
    console.log("  • sub (User ID):", payloadObj.sub ? `✅ ${payloadObj.sub}` : "❌ Falta");
    console.log("  • rol (Role):", payloadObj.rol ? `✅ ${payloadObj.rol}` : "⚠️ Falta");
    console.log("  • exp (Expiración):", payloadObj.exp ? `✅ ${new Date(payloadObj.exp * 1000)}` : "❌ Falta");

    // Verificar si el token está expirado
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payloadObj.exp <= now;
    console.log("  • ¿Expirado?:", isExpired ? "❌ SÍ" : `✅ No (en ${(payloadObj.exp - now) / 60} minutos)`);

    // Mostrar datos del usuario
    console.log("\n👤 Datos del Usuario en localStorage:");
    if (user) {
      const userData = JSON.parse(user);
      console.table(userData);
    } else {
      console.warn("⚠️ No hay datos de usuario en localStorage");
    }

    // Resumen
    console.log("\n📌 RESUMEN:");
    const hasRol = !!payloadObj.rol;
    const hasRolInUser = user ? JSON.parse(user).rol : null;

    if (hasRol) {
      console.log("✅ El rol ESTÁ en el JWT →", payloadObj.rol);
    } else if (hasRolInUser) {
      console.log(
        `⚠️ El rol NO está en el JWT, pero está en localStorage → ${hasRolInUser}`
      );
    } else {
      console.error("❌ NO HAY ROL EN NINGÚN LUGAR");
    }
  } catch (error) {
    console.error("❌ Error al decodificar JWT:", error);
  }

  console.log("\n========== FIN TEST ==========");
}

// Ejecutar la prueba
testJWT();

// Exportar para uso manual
window.testJWT = testJWT;
console.log('\n💡 Puedes ejecutar testJWT() de nuevo en cualquier momento');
