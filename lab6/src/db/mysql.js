const mysql = require("mysql2/promise");
const { mysqlUri } = require("../config/env");

const pool = mysql.createPool(mysqlUri);

module.exports = pool;