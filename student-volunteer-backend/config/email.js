const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dharunkumar.se23@bitsathy.ac.in",
    pass: "sevo rpln qffs jpve"
  }
});

module.exports = transporter;