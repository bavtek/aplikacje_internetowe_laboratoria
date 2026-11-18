const mongoose = require("mongoose")
const { mongoUri } = require("../src/config/env")
const Student = require("../src/models/Student")
const repo = require("../src/repositories/studentRepository")

const TEST_EMAIL = "test.lab5@example.com"

async function main() {
    await mongoose.connect(mongoUri)
    console.log("Połączono z MongoDB")

    // Poczekaj na zbudowanie indeksów (w tym unikatowego) i wyczyść pozostałości
    await Student.init()
    await Student.deleteMany({ email: TEST_EMAIL })

    // 1. create
    const created = await repo.create({
        fullName: "Jan Testowy",
        email: TEST_EMAIL,
        city: "Lublin",
        fieldOfStudy: "Informatyka",
        year: 2
    })
    console.log("create:", created._id.toString(), created.email)

    // 2. findAll
    const all = await repo.findAll()
    console.log("findAll: liczba rekordów =", all.length)

    // 3. findById
    const found = await repo.findById(created._id)
    console.log("findById:", found ? found.fullName : null)

    // 4. update
    const updated = await repo.update(created._id, { city: "Warszawa", year: 3 })
    console.log("update:", updated.city, updated.year)

    // 5. brak dokumentu (poprawny, ale nieistniejący id)
    const missingId = new mongoose.Types.ObjectId()
    console.log("findById (brak):", await repo.findById(missingId))
    console.log("update (brak):", await repo.update(missingId, { city: "X" }))
    console.log("remove (brak):", await repo.remove(missingId))

    // 6. niepoprawny identyfikator
    console.log('findById("abc"):', await repo.findById("abc"))

    // 7. błąd walidacji (niepoprawny e-mail)
    try {
        await repo.create({
            fullName: "Zły Email",
            email: "to-nie-jest-email",
            city: "Lublin",
            fieldOfStudy: "Informatyka",
            year: 1
        })
    } catch (err) {
        console.log("walidacja:", err.name, "-", err.errors.email.message)
    }

    // 8. duplikat e-maila
    try {
        await repo.create({
            fullName: "Duplikat Testowy",
            email: TEST_EMAIL,
            city: "Kraków",
            fieldOfStudy: "Matematyka",
            year: 1
        })
        console.log("BŁĄD: duplikat został zapisany")
    } catch (err) {
        if (err.code === 11000) {
            console.log("duplikat e-maila wykryty (kod 11000)")
        } else {
            throw err
        }
    }

    // 9. remove
    const removed = await repo.remove(created._id)
    console.log("remove:", removed ? "usunięto" : "brak")
    console.log("findById po usunięciu:", await repo.findById(created._id))
}

main()
    .catch((err) => {
        console.error(err)
        process.exitCode = 1
    })
    .finally(async () => {
        await mongoose.disconnect()
    })