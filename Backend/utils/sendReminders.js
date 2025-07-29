/*require('dotenv').config();

const Appointment = require('../models/Appointment');
const { sendEmail } = require('./emailService');

const sendReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);

    const appointments = await Appointment.find({
      appointmentDate: { $gte: tomorrow, $lt: nextDay },
    });

    for (const appointment of appointments) {
      // Send to patient
      await sendEmail(
        appointment.patientEmail,
        'Appointment Reminder',
        `Dear ${appointment.patientName}, this is a reminder for your appointment with Dr. ${appointment.doctorName} on ${appointment.appointmentDate.toDateString()} at ${appointment.appointmentTime}.`
      );

      // Send to doctor
      await sendEmail(
        appointment.doctorEmail, // make sure this exists in your Appointment schema
        'Appointment Reminder',
        `Dear Dr. ${appointment.doctorName}, you have an appointment with ${appointment.patientName} on ${appointment.appointmentDate.toDateString()} at ${appointment.appointmentTime}.`
      );
    }

    console.log(`✅ Sent reminders for ${appointments.length} appointments (to both patients and doctors)`);
  } catch (err) {
    console.error('❌ Reminder job failed:', err);
  }
};

module.exports = sendReminders;*/



require('dotenv').config();
const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const { sendEmail } = require('./emailService'); // Replace with your actual email function
const DoctorProfile = require('../models/DoctorProfile');

const sendReminders = async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextDay = new Date(tomorrow.getTime() + 60 * 60 * 1000); // 1 hour range

    const appointments = await Appointment.find({
      appointmentDate: { $gte: tomorrow, $lt: nextDay },
      reminderSent: false, // ✅ only send reminder if not already sent
    }).populate('doctorId');

    for (const appointment of appointments) {
      // Send email to patient
      await sendEmail(
        appointment.patientEmail,
        'Appointment Reminder',
        Dear ${appointment.patientName}, this is a reminder for your appointment with Dr. ${appointment.doctorName} on ${appointment.appointmentDate.toDateString()} at ${appointment.appointmentTime}.
      );

      // Send email to doctor
      await sendEmail(
        appointment.doctorId.email, // ✅ populated from doctorId
        'Appointment Reminder',
        Dear Dr. ${appointment.doctorName}, you have an appointment with ${appointment.patientName} on ${appointment.appointmentDate.toDateString()} at ${appointment.appointmentTime}.
      );

      // ✅ Mark reminder as sent
      appointment.reminderSent = true;
      await appointment.save();
    }

  } catch (error) {
    console.error('❌ Error sending reminders:', error);
  }
};
module.exports = sendReminders;

