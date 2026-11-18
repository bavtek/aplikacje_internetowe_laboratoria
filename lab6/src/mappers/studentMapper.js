function toStudent(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    city: row.city,
    fieldOfStudy: row.field_of_study,
    year: row.year,
    active: Boolean(row.active),
    createdAt: row.created_at
  };
}

module.exports = { toStudent };