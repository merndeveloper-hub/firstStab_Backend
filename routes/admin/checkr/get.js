import Joi from "joi";
import axios from "axios";


const schema = Joi.object().keys({
  id: Joi.string().required(),
});

const getInvitationStatus = async (req, res) => {
  try {
   const url = `${process.env.CHECKR_INVITATION_DEVELOPMENT_URL}/${id}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.CHECKR_CLIENT_SECRET}`, // 👈 Base64 encoded key:secret
      },
    };

    const response = await axios.get(url, config);

    console.log("Invitation Detail ✅", response.data);
  

  return response?.data?.id;

   
  } catch (e) {
    console.log(e);
    return res.status(400).json({ status: 400, message: e.message });
  }
};

export default getInvitationStatus;
