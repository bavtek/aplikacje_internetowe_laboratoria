const mongoose = require("mongoose")
const { mongoUri } = require("../src/config/env")

async function main() {
    await mongoose.connect(mongoUri)
    console.log("Połączono z MongoDB")
    await mongoose.disconnect()
}

main().catch((err) => {
    console.error(err.message)
    process.exit(1)
})