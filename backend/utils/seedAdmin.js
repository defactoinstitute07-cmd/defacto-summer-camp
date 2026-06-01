/**
 * Seed Script — creates the initial superadmin account.
 * Run once: npm run seed
 * Uses env vars: SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const seed = async () => {
  await connectDB();

  const { SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env;

  if (!SEED_ADMIN_USERNAME || !SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    console.error(
      "❌ Missing SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL, or SEED_ADMIN_PASSWORD in .env"
    );
    process.exit(1);
  }

  const existing = await Admin.findOne({ email: SEED_ADMIN_EMAIL });
  if (existing) {
    console.log(`ℹ️  Superadmin already exists: ${existing.email}`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 12);
  const admin = await Admin.create({
    username: SEED_ADMIN_USERNAME,
    email: SEED_ADMIN_EMAIL,
    password: passwordHash,
    role: "superadmin",
  });

  console.log(`✅ Superadmin created:`);
  console.log(`   Username : ${admin.username}`);
  console.log(`   Email    : ${admin.email}`);
  console.log(`   Role     : ${admin.role}`);
  console.log(`\n⚠️  Change the default password immediately after first login!`);
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
