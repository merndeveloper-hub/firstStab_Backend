import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } from "../../config/index.js";


// const transporter = nodemailer.createTransport({
//   host: MAIL_HOST,
//   port: MAIL_PORT,
//   secure: true,
//   auth: {
//     user: MAIL_USER,
//     pass: MAIL_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// Environment-specific config
const isProd = process.env.NODE_ENV === 'production';

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: isProd ? MAIL_PORT : MAIL_PORT, // both dev & prod use 587
  secure: false,             // false for STARTTLS (port 587)
  auth: {
    user: 'apikey',          // literally 'apikey'
    pass: isProd
      ? process.env.SENDGRID_API_KEY_PROD
      : process.env.MAIL_PASS,
  },
  tls: {
    ciphers: 'TLSv1.2',      // enforce modern TLS
  },
});


const readHTMLFile = function (path, callback) {
  fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, html);
    }
  });
};

const send_email = async (template, replacements, from, subject, email) => {
  console.log("send_email");
  readHTMLFile(
    `./public/email-templates/${template}.html`,
    function (err, html) {
      var template = handlebars.compile(html);


      var htmlToSend = template(replacements);

      const mailOptions = {
        from: `${from}`,
        to: email,
        subject: subject, //"Awaiting Admin Approval",
        html: htmlToSend,

      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log("Error===>", error);
        }

      });
    }
  );
};

export default send_email

