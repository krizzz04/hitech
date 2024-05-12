const mongoose = require('mongoose');

// Define the schema for the NormalBooking collection
const normalBookingSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  place: String,
  date: Date,
  patientId: String, // Unique identifier for the patient associated with the booking
  resultPdf: String, // Path to the result PDF associated with the booking
  amount: Number // Amount associated with the booking
});

// Create a Mongoose model for the NormalBooking schema
const NormalBooking = mongoose.model('NormalBooking', normalBookingSchema);

// Export the NormalBooking model to make it accessible in other parts of the application
module.exports = NormalBooking;
