const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const fs = require('fs');
const Appointment = require('./models/appoinment');
const User = require('./models/user');
const NormalBooking = require('./models/NormalBooking');
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: 'rzp_test_gofyBaGgfftmg5',
  key_secret: '6UdbvfpR2LpDV2ddkytgU546',
});


const app = express();
const port = 5000;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/laboratory', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Define router for /normal-booking
// Define router for /normal-booking
const normalBookingRouter = express.Router();

// Handle POST requests to /normal-booking
// Handle POST requests to /normal-booking
normalBookingRouter.post('/', upload.single('resultPdf'), async (req, res) => {
  try {
      const { name, phoneNumber, amount, date } = req.body;
      const resultPdf = req.file ? req.file.path : null;

      // Create a new normal booking with a unique ID
      const appointmentDate = new Date(date);
      const patientId = generateUniqueId(name, appointmentDate, phoneNumber);

      // Save the normal booking to the database
      const normalBooking = new NormalBooking({
          name,
          phoneNumber,
          amount,
          date,
          orderId,
          patientId,
          resultPdf, // Save the path to the result file
      });
      await normalBooking.save();
      console.log('Normal Booking saved successfully');
      res.redirect('/normal-booking');
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    // User is authenticated, allow access
    next();
  } else {
    // User is not authenticated, redirect to login page
    res.redirect('/login');
  }
};

// Route for the admin page, protected by isAuthenticated middleware
app.get('/adminpage.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'adminpage.html'));
});

// Route for /normal-booking, also protected by isAuthenticated middleware
app.get('/normal-booking', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'adminpage.html'));
});





// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lab.html'));
});

app.post('/book-appointment', async (req, res) => {
  const { name, place, phoneNumber, date } = req.body;
  // Convert the date string to a JavaScript Date object
  const appointmentDate = new Date(date);
  // Generate patient ID based on name and date
  const patientId = generateUniqueId(name, appointmentDate, phoneNumber);

  try {
    const newAppointment = new Appointment({ name, place, phoneNumber, date: appointmentDate, patientId });
    await newAppointment.save();
    console.log('Appointment saved successfully');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to book appointment');
  }
});

app.post('/upload-result', upload.single('resultPdf'), async (req, res) => {
  const { patientId, amount } = req.body;
  const resultPdf = req.file.path;

  // Check if amount is a valid number
  if (isNaN(parseFloat(amount))) {
    res.status(400).send('Amount must be a valid number');
    return;
  }

  try {
      // Check if an appointment with the given patientId exists
      const existingAppointment = await Appointment.findOne({ patientId });

      if (!existingAppointment) {
          res.send('No appointment found with that ID');
          return;
      }

      // Update the resultPdf and amount for the existing appointment
      existingAppointment.resultPdf = resultPdf;
      existingAppointment.amount = parseFloat(amount); // Update the amount as a float
      await existingAppointment.save();

      res.send('Result uploaded successfully');
  } catch (err) {
      console.error(err);
      res.status(500).send('Failed to upload result');
  }
});

app.get('/admin', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.render('admin', { appointments });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch appointments');
  }
});

app.get('/ladmin', async (req, res) => {
  try {
    const appointments = await NormalBooking.find();
    res.render('offline', { appointments });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch appointments');
  }
});

app.get('/get-result', async (req, res) => {
  const { patientId } = req.query;

  try {
    // Try to find the appointment in the Appointment collection
    let appointment = await Appointment.findOne({ patientId });

    // If not found, try to find in the NormalBooking collection
    if (!appointment) {
      appointment = await NormalBooking.findOne({ patientId });
    }

    if (!appointment) {
      return res.status(404).send('No appointment found with that patient ID');
    }

    // Check if the result is already paid for (amount > 0)
    if (appointment.amount > 0) {
      // Generate the Razorpay order
      const paymentOptions = {
        amount: appointment.amount * 100, // Amount in paisa
        currency: 'INR',
        receipt: patientId,
        payment_capture: 1,
      };

      razorpay.orders.create(paymentOptions, async (err, order) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Failed to create payment order');
        }

        // Log the orderId
        console.log('Order ID:', order.id);

        // Update the appointment with the orderId
        appointment.orderId = order.id;
        await appointment.save();

        // Redirect to the Razorpay payment page with orderId as a query parameter
        res.redirect(`/razorpay-payment?orderId=${order.id}`);
      });
    } else {
      // Log the file path to verify
      console.log('File path:', appointment.resultPdf);

      // Check if the file exists
      if (fs.existsSync(appointment.resultPdf)) {
        // Send the result file as a download
        res.download(appointment.resultPdf);
      } else {
        res.status(404).send('Result file not found');
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch result');
  }
});


app.get('/razorpay-payment', async (req, res) => {
  const { orderId } = req.query;

  try {
    if (!orderId) {
      console.log('Order ID not provided');
      return res.status(400).send('Order ID not provided');
    }

    // Find the appointment with the provided orderId
    let appointment = await Appointment.findOne({ orderId });

    // If not found, try to find in the NormalBooking collection
    if (!appointment) {
      appointment = await NormalBooking.findOne({ orderId });
    }

    if (!appointment) {
      console.log('Appointment not found for Order ID:', orderId);
      return res.status(404).send('Appointment not found');
    }

    // Check if the amount for the appointment is greater than 0
    if (appointment.amount > 0) {
      // If the amount is greater than 0, redirect to the Razorpay payment page
      const paymentLink = `/razorpay-payment-page?orderId=${orderId}`;
      res.redirect(paymentLink);
    } else {
      // If the amount is 0, proceed with direct download
      res.download(appointment.resultPdf);
    }
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).send('Failed to process payment');
  }
});

// Define the /razorpay-payment-page route
app.get('/razorpay-payment-page', async (req, res) => {
  const { orderId } = req.query;

  // Check if orderId is provided
  if (!orderId) {
    console.log('Order ID not provided');
    res.status(400).send('Order ID not provided');
    return;
  }

  try {
    // Find the appointment with the provided orderId
    let appointment = await Appointment.findOne({ orderId });

    // If not found, try to find in the NormalBooking collection
    if (!appointment) {
      appointment = await NormalBooking.findOne({ orderId });
    }

    if (!appointment) {
      console.log('Appointment not found for Order ID:', orderId);
      return res.status(404).send('Appointment not found');
    }

    // Check if the amount for the appointment is greater than 0
    if (appointment.amount > 0) {
      // If the amount is greater than 0, construct the Razorpay payment URL
      const paymentUrl = `https://api.razorpay.com/v1/checkout/embedded?order_id=${orderId}&key_id=rzp_test_gofyBaGgfftmg5`;

      // Redirect to the Razorpay payment page
      res.redirect(paymentUrl);
    } else {
      // If the amount is 0, proceed with direct download
      res.download(appointment.resultPdf);
    }
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).send('Failed to process payment');
  }
});




// Define the /razorpay-payment-page route
app.get('/razorpay-payment-page', async (req, res) => {
  const { orderId } = req.query;

  // Check if orderId is provided
  if (!orderId) {
    console.log('Order ID not providedd');
    res.status(400).send('Order ID not provided');
    return;
  }

  // Proceed with the rest of your logic for displaying the payment page
  res.render('razorpay-payment-page', { orderId });
});

// Define the /razorpay-payment route
app.get('/razorpay-payment', async (req, res) => {
  const { orderId } = req.query;

  try {
    if (!orderId) {
      console.log('Order ID not provided');
      return res.status(400).send('Order ID not provided');
    }

    // Find the appointment with the provided orderId
    let appointment = await Appointment.findOne({ orderId });

    // If not found, try to find in the NormalBooking collection
    if (!appointment) {
      appointment = await NormalBooking.findOne({ orderId });
    }

    if (!appointment) {
      console.log('Appointment not found for Order ID:', orderId);
      return res.status(404).send('Appointment not found');
    }

    // Check if the amount for the appointment is greater than 0
    if (appointment.amount > 0) {
      // If the amount is greater than 0, redirect to the Razorpay payment page
      res.render('razorpay-payment-page', { orderId });
    } else {
      // If the amount is 0, proceed with direct download
      res.download(appointment.resultPdf);
    }
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).send('Failed to process payment');
  }
});

// Define the success route
app.get('/razorpay-success', async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.query;

  // Verify the payment signature (you should implement this logic)
  const isValidSignature = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  if (isValidSignature) {
    // Payment signature is valid, update the appointment as paid
    // You should implement this logic based on your database structure
    // For example:
    // const appointment = await Appointment.findOneAndUpdate({ orderId: razorpay_order_id }, { paid: true });

    res.send('Payment successful. Thank you for your payment.');
  } else {
    res.status(400).send('Invalid payment signature');
  }
});

// Define the failure route
app.get('/razorpay-failure', async (req, res) => {
  res.send('Payment failed. Please try again.');
});

// Function to verify the payment signature (you should implement this logic)
function verifySignature(orderId, paymentId, signature) {
  // Implement your signature verification logic here
  // For example:
  // const secret = 'your_razorpay_secret_key';
  // const generatedSignature = hmacSha256(orderId + '|' + paymentId, secret);
  // return signature === generatedSignature;

  return true; // For demo purposes, return true to always verify the signature
}



app.get('/generate-payment-link', async (req, res) => {
  const { patientId } = req.query;

  try {
    // Query the appointments collection to find the appointment with the given patientId
    const appointment = await Appointment.findOne({ patientId });

    if (!appointment) {
      // If no appointment found, return an error
      return res.status(404).send('No appointment found with that ID');
    }

    // Generate the Razorpay order
    const paymentOptions = {
      amount: appointment.amount * 100, // Amount in paisa
      currency: 'INR',
      receipt: patientId,
      payment_capture: 1,
    };

    razorpay.orders.create(paymentOptions, async (err, order) => {
      if (err) {
        console.error(err);
        res.status(500).send('Failed to create payment order');
        return;
      }

      // Log the orderId
      console.log('Order ID:', order.id);

      // Update the appointment with the orderId
      appointment.orderId = order.id;
      await appointment.save();

      // Construct the redirect URL with the orderId
      const deepLink = `/razorpay-payment?orderId=${order.id}`;
      res.redirect(deepLink);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to generate payment link');
  }
});


app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


const session = require('express-session');

// Use express-session middleware
app.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: true
}));



app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log('Attempting login for username:', username);

    // Find the user with the provided username
    const user = await User.findOne({ username });

    if (!user) {
      console.log('User not found');
      return res.status(404).send('User not found');
    }

    // Check if the provided password matches the stored password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log('Invalid password');
      return res.status(401).send('Invalid password');  
    }

    console.log('Login successful for username:', username);

    // Store user information in session
    req.session.user = user;

    // Redirect the user to the admin dashboard after successful login
    res.redirect('/adminpage.html');
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Internal Server Error');
  }
});


// Add a route to handle GET requests for fetching the result
app.get('/patient-results', async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ /* your query criteria */ });

    if (!appointment) {
      return res.status(404).send('Appointment not found');
    }

    res.render('patient-result', { appointment });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch appointment');
  }
});



// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

function generateUniqueId(name, date, phoneNumber) {
  // Extract day, month, and year from the date
  const day = ('0' + date.getDate()).slice(-2); // Pad with zero if needed
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
  const phoneNumberLastFour = phoneNumber.slice(-4); // Get the last four digits of the phone number
  
  // Remove spaces from the name and concatenate with day, month, and last four digits of the phone number to create the patient ID
  const patientId = name.replace(/\s/g, '') + day + month + phoneNumberLastFour;
  
  return patientId;
}


// Delete an appointment
app.delete('/appointments/:id', async (req, res) => {
  const appointmentId = req.params.id;

  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(appointmentId);

    if (!deletedAppointment) {
      return res.status(404).send('No appointment found with that ID');
    }

    console.log('Appointment deleted successfully');
    res.send('Appointment deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete appointment');
  }
});






app.delete('/normalbookings/:id', async (req, res) => {
    const normalBookingId = req.params.id;

    try {
        const deletedNormalBooking = await NormalBooking.findByIdAndDelete(normalBookingId);

        if (!deletedNormalBooking) {
            return res.status(404).send('No normal booking found with that ID');
        }

        console.log('Normal booking deleted successfully');
        res.send('Normal booking deleted successfully');
    } catch (err) {
        console.error('Error deleting normal booking:', err);
        res.status(500).send('Failed to delete normal booking');
    }
});
