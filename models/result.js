const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  patientId: String,
  resultFilePath: String
});

module.exports = mongoose.model('Result', resultSchema);
