// Safely evolves an already-running database: adds new columns to `bookings`
// if missing, and backfills a `listing_plans` row for any existing listing
// that doesn't have one yet (from its legacy price/price_period).
// Safe to re-run. Usage: node db/migrate.js
require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");

async function columnExists(conn, table, column) {
  const [rows] = await conn.execute(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].cnt > 0;
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "strivio",
  });

  if (!(await columnExists(conn, "bookings", "plan_id"))) {
    await conn.execute(`ALTER TABLE bookings ADD COLUMN plan_id INT NULL AFTER listing_id`);
    console.log("Added bookings.plan_id");
  }
  if (!(await columnExists(conn, "bookings", "persons"))) {
    await conn.execute(`ALTER TABLE bookings ADD COLUMN persons INT NULL AFTER plan_name`);
    console.log("Added bookings.persons");
  }
  if (!(await columnExists(conn, "partner_listings", "latitude"))) {
    await conn.execute(`ALTER TABLE partner_listings ADD COLUMN latitude DECIMAL(10,7) NULL AFTER closing_time`);
    console.log("Added partner_listings.latitude");
  }
  if (!(await columnExists(conn, "partner_listings", "longitude"))) {
    await conn.execute(`ALTER TABLE partner_listings ADD COLUMN longitude DECIMAL(10,7) NULL AFTER latitude`);
    console.log("Added partner_listings.longitude");
  }

  const [fkRows] = await conn.execute(
    `SELECT COUNT(*) AS cnt FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND CONSTRAINT_NAME = 'fk_booking_plan'`
  );
  if (fkRows[0].cnt === 0) {
    await conn.execute(
      `ALTER TABLE bookings ADD CONSTRAINT fk_booking_plan FOREIGN KEY (plan_id) REFERENCES listing_plans(id) ON DELETE SET NULL`
    );
    console.log("Added bookings.fk_booking_plan");
  }

  // Backfill: any listing without plans yet gets one plan derived from its legacy price/price_period.
  const [listings] = await conn.execute(
    `SELECT pl.id, pl.price, pl.price_period FROM partner_listings pl
     LEFT JOIN listing_plans lp ON lp.listing_id = pl.id
     WHERE lp.id IS NULL`
  );
  for (const l of listings) {
    const period = ["day", "session", "month", "quarter", "year"].includes(l.price_period) ? l.price_period : "month";
    await conn.execute(
      `INSERT INTO listing_plans (listing_id, period, price, persons, label) VALUES (?, ?, ?, NULL, NULL)`,
      [l.id, period, l.price]
    );
    console.log(`Backfilled plan for listing #${l.id}`);
  }

  await conn.end();
  console.log("Migration complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
