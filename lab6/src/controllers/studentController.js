const studentRepository = require("../repositories/mysql/studentRepository");
const { toStudent } = require("../mappers/studentMapper");

async function getAll(req, res, next) {
  try {
    const result = await studentRepository.findAll(req.query);
    // Jeśli findAll z Lab 5 zwraca { items, ... }:
    if (result.items) {
      return res.json({
        ...result,
        items: result.items.map(toStudent)
      });
    }
    // Jeśli zwraca samą tablicę:
    res.json(result.map(toStudent));
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const row = await studentRepository.findById(req.params.id);
    if (!row) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(toStudent(row));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const row = await studentRepository.create(req.body);
    res.status(201).json(toStudent(row));
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const updated = await studentRepository.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Student not found" });
    }
    const row = await studentRepository.findById(req.params.id);
    res.json(toStudent(row));
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const deleted = await studentRepository.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };