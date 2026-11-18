function errorHandler(err, req, res, next) {
  if (err.code === "ER_DUP_ENTRY" || err.errno === 1062) {
    return res.status(409).json({ error: "Email already exists" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

module.exports = errorHandler;