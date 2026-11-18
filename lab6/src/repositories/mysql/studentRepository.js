const pool = require("../../db/mysql");

const SORT = {
  fullName: "full_name",
  city: "city",
  year: "year",
  createdAt: "created_at"
};

async function findAll({ city, fieldOfStudy, page = 1, limit = 10, sortBy, order = "asc" } = {}) {
  const conditions = [];
  const params = [];

  if (typeof city === "string" && city.trim()) {
    conditions.push("city = ?");
    params.push(city.trim());
  }

  if (typeof fieldOfStudy === "string" && fieldOfStudy.trim()) {
    conditions.push("field_of_study = ?");
    params.push(fieldOfStudy.trim());
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortColumn = SORT[sortBy] || "full_name";
  const sortDirection = order === "desc" ? "DESC" : "ASC";

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const offset = (pageNum - 1) * limitNum;

  const query = `
    SELECT id, full_name, email, city, field_of_study, year, active, created_at
    FROM students
    ${whereClause}
    ORDER BY ${sortColumn} ${sortDirection}, id ${sortDirection}
    LIMIT ? OFFSET ?
  `;

  const queryParams = [...params, String(limitNum), String(offset)];
  const [rows] = await pool.execute(query, queryParams);

  const countQuery = `SELECT COUNT(*) AS total FROM students ${whereClause}`;
  const [countRows] = await pool.execute(countQuery, params);
  const total = countRows[0].total;

  return { items: rows, total };
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT id, full_name, email, city, field_of_study, year, active, created_at
     FROM students
     WHERE id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

async function create({ fullName, email, city, fieldOfStudy, year, active = true }) {
  const [result] = await pool.execute(
    `INSERT INTO students (full_name, email, city, field_of_study, year, active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [fullName, email, city, fieldOfStudy, year, active]
  );
  return findById(result.insertId);
}

async function update(id, { fullName, email, city, fieldOfStudy, year, active = true }) {
  const [result] = await pool.execute(
    `UPDATE students
     SET full_name = ?, email = ?, city = ?, field_of_study = ?, year = ?, active = ?
     WHERE id = ?`,
    [fullName, email, city, fieldOfStudy, year, active, id]
  );
  return result.affectedRows === 1;
}

async function remove(id) {
  const [result] = await pool.execute(
    `DELETE FROM students WHERE id = ?`,
    [id]
  );
  return result.affectedRows === 1;
}

module.exports = { findAll, findById, create, update, remove };