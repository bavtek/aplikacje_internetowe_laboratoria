const express = require("express");
const studentRoutes = require("./routes/studentRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(express.json());

const v1 = express.Router();
v1.use("/students", studentRoutes);
app.use("/api/v1", v1);

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);

module.exports = app;