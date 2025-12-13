
import bcrypt from "bcryptjs";
import send_email from "../../../lib/node-mailer/index.js";
import { insertNewDocument, findOne } from "../../../helpers/index.js";


const sendOTP = async (req, res) => {


  try {


    const { email, userType } = req;

    const user = await findOne("user", { email, userType });



    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;




    // hash the otp
    const saltRounds = 10;

    const hashedOTP = await bcrypt.hash(otp, saltRounds);




    const otpRes = await insertNewDocument("userOTP", {
      userEmail: email,
      userType: userType,
      otp: hashedOTP,
      status: "Pending",
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });



    await send_email(
      "otpTemplate", // Template name change
      {
        user: user?.first_Name,
        otp: otp
      },
      process.env.SENDER_EMAIL,
      "Your FirstStab Verification Code", // Better subject
      user?.email // Changed from 'email' to 'user?.email' for consistency
    );

  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: "Enter current otp",
    });
  }
};

export default sendOTP;
