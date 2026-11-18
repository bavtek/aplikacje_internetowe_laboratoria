const mongoose = require("mongoose")
const Student = require("../models/Student")

async function findAll() {
    return Student.find().sort({ createdAt: -1 })
}

async function findById(id) {
    if (!mongoose.isObjectIdOrHexString(id)) {
        return null
    }
    return Student.findById(id)
}

async function create(data) {
    return Student.create(data)
}

async function update(id, data) {
    if (!mongoose.isObjectIdOrHexString(id)) {
        return null
    }
    return Student.findByIdAndUpdate(id, data, {
        returnDocument: "after",
        runValidators: true
    })
}

async function remove(id) {
    if (!mongoose.isObjectIdOrHexString(id)) {
        return null
    }
    return Student.findByIdAndDelete(id)
}

module.exports = { findAll, findById, create, update, remove }