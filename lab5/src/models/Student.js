const mongoose = require("mongoose")

const studentSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 120
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Niepoprawny adres e-mail"]
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        fieldOfStudy: {
            type: String,
            required: true,
            trim: true
        },
        year: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
)

const Student = mongoose.model("Student", studentSchema)

module.exports = Student