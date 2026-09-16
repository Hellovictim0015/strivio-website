// Seeds the demo admin account and a starter set of categories.
// Safe to re-run: uses INSERT ... ON DUPLICATE KEY UPDATE / existence checks.
// Usage: node db/seed.js
require("dotenv").config({ path: ".env.local" });
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");

const STARTER_CATEGORIES = [
  { name: "Gym", description: "Strength training & fitness centers" },
  { name: "Yoga", description: "Yoga studios & wellness classes" },
  { name: "Track", description: "Running tracks & athletics" },
  { name: "Swimming", description: "Swimming pools & aquatic centers" },
  { name: "Sports", description: "Multi-sport courts & academies" },
  { name: "Dance", description: "Dance & Zumba studios" },
];

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "strivio",
  });

  const adminEmail = (process.env.ADMIN_SEED_EMAIL || "admin@strivio.com").toLowerCase();
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "Admin@12345";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const [existing] = await conn.execute("SELECT id FROM admins WHERE email = ?", [adminEmail]);
  if (existing.length === 0) {
    await conn.execute(
      "INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)",
      [adminEmail, passwordHash, "Super Admin"]
    );
    console.log(`Created demo admin: ${adminEmail}`);
  } else {
    await conn.execute("UPDATE admins SET password_hash = ? WHERE email = ?", [passwordHash, adminEmail]);
    console.log(`Demo admin already existed, password reset: ${adminEmail}`);
  }

  for (const cat of STARTER_CATEGORIES) {
    const [rows] = await conn.execute("SELECT id FROM categories WHERE name = ?", [cat.name]);
    if (rows.length === 0) {
      await conn.execute(
        "INSERT INTO categories (name, description, status) VALUES (?, ?, 'active')",
        [cat.name, cat.description]
      );
      console.log(`Created category: ${cat.name}`);
    }
  }

  await conn.end();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
