const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  name: String,
  orderId:String,
  place: String,
  phoneNumber: String,
  date: {
    type: Date,
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: props => `${props.value} is not a valid date!`
    }
  },
  patientId: { type: String, unique: true },
  resultPdf: String,
  amount: Number // Add the amount field
});


const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
