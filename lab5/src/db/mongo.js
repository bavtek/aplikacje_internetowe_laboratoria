const { mongoUri } = require("../config/env")
const mongoose = require("mongoose")

async function connectMongo() {
    await mongoose.connect(mongoUri)
    console.log("Połączono z MongoDB")
}

module.exports = { connectMongo }