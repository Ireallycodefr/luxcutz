require
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const { existsSync, writeFileSync, readFileSync } = fs;

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// File to store appointments
const appointmentsFile = path.join(__dirname, "appointments.json");

// Read saved appointments
function readAppointments() {
if (!existsSync(appointmentsFile)) {
writeFileSync(appointmentsFile, "[]");
}
const data = readFileSync(appointmentsFile);
return JSON.parse(data);
}

// Save updated appointments
function writeAppointments(appointments) {
writeFileSync(appointmentsFile, JSON.stringify(appointments, null, 2));
}

// Get time slots based on day of week
function getTimesForDate(dateStr) {
const date = new Date(dateStr);
const day = date.getDay();

if (day === 0 || day === 6) {
return [
"12:00 PM",
"12:30 PM",
"1:00 PM",
"1:30 PM",
"2:00 PM",
"2:30 PM",
"3:00 PM",
"3:30 PM",
"4:00 PM",
"4:30 PM",
"5:00 PM",
"5:30 PM",
"6:00 PM",
"6:30 PM",
"7:00 PM"
];
} else {
return [
"4:15 PM",
"4:30 PM",
"4:45 PM",
"5:00 PM",
"5:15 PM",
"5:30 PM",
"5:45 PM",
"6:00 PM",
"6:15 PM",
"6:30 PM",
"6:45 PM",
"7:00 PM"
];
}
}

// Nodemailer transporter
const transporter = nodemailer.createTransport({
host: "smtp.mail.yahoo.com",
port: 465,
secure: true,
auth: {
user: "Alvarezbryan111@yahoo.com",
pass: process.env.EMAIL_PASS
},
});

// Endpoint to book appointment
app.post("/book-appointment", (req, res) => {
const { customerName, customerEmail, appointmentDate, appointmentTime } = req.body;

if (!customerName || !customerEmail || !appointmentDate || !appointmentTime) {
return res.status(400).json({ error: "All fields are required" });
}

const appointments = readAppointments();
const isTaken = appointments.some(
(appt) => appt.date === appointmentDate && appt.time === appointmentTime
);

if (isTaken) {
return res.status(400).json({ error: "This time slot is already booked" });
}

appointments.push({
date: appointmentDate,
time: appointmentTime,
customerName,
customerEmail
});
writeAppointments(appointments);

const mailOptions = {
from: "Alvarezbryan111@yahoo.com",
to: "Alvarezbryan111@yahoo.com",
subject: "New Appointment Booked",
text: `A new appointment has been booked:\n\nCustomer: ${customerName}\nEmail: ${customerEmail}\nDate: ${appointmentDate}\nTime: ${appointmentTime}`
};

transporter.sendMail(mailOptions, (error, info) => {
if (error) {
console.error("Email error:", error);
return res.status(500).json({ error: "Email sending failed" });
}
console.log("Email sent:", info.response);
res.status(200).json({ message: "Appointment booked successfully!" });
});
});

// Endpoint to get available times
app.get("/available-times", (req, res) => {
const { date } = req.query;
if (!date) return res.status(400).json({ error: "Date is required" });

const allTimes = getTimesForDate(date);
const appointments = readAppointments();
const bookedTimes = appointments
.filter((appt) => appt.date === date)
.map((appt) => appt.time);
const available = allTimes.filter((time) => !bookedTimes.includes(time));
res.json(available);
});

// Start the server
app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});
