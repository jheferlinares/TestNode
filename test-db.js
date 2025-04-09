const db = require("./database");

(async () => {
  try {
    const result = await db.query("SELECT NOW()");
    console.log("✅ ¡Conexión exitosa!", result.rows);
  } catch (err) {
    console.error("❌ Error al conectar a la base de datos:", err);
  }
})();