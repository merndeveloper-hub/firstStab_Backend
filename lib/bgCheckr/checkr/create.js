import axios from 'axios';
import {findOne} from '../../../helpers/index.js'


const createCandidates = async (req, res) => {

  const {id} = req.params
  try {

    const findUser = await findOne('user',{_id:id, userType:'pro'})
console.log(findUser,"finsuser");

    const data = {
      first_name: findUser?.first_Name,
      last_name: findUser?.last_Name,
      email: findUser?.email,
      middle_name: '',
      work_locations: [
        {
          country: findUser?.country,
          state: findUser?.state,
          city: findUser?.city
        }
      ]
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.CHECKR_CLIENT_SECRET,
      }
    };

    //const url = 'https://api.checkr-staging.com/v1/candidates/';
const url = process.env.CHECKR_CANDIDATE_DEVELOPMENT_URL
    const response = await axios.post(url, data, config);

 //   console.log(response.data, "response");
if(!response){
return res.status(400).json({ status: 400, message: error.response?.data || 'No candidate found' });
}
console.log(response,"response----");


const inviteData = {
  candidate_id: response?.candidate_id,
  work_locations: [
    {
      // country: 'US',
      // state: 'CA',
      // city: 'San Jose'
      country: findUser?.country,
          state: findUser?.state,
          city: findUser?.city
    }
  ],
 // package: 'basic_criminal_and_plv'
  package:response?.package
};

  const inviteconfig = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.CHECKR_CLIENT_SECRET,
      }
    };

 //   const inviteurl = 'https://api.checkr-staging.com/v1/invitations';
 const inviteurl = process.env.CHECKR_CANDIDATE_INVITAION_DEVELOPMENT_URL  
 const inviteresponse = await axios.post(inviteurl, inviteData, inviteconfig);

    console.log(inviteresponse.data, "response");

// if(!inviteresponse || inviteresponse.data.status == 'pending'){
// return res.status(400).json({ status: 400, message: error.inviteresponse?.data || 'Service background verification still pending' });
// }

if(!inviteresponse){
return res.status(400).json({ status: 400, message: error.inviteresponse?.data || 'Service background verification still pending' });
}

    return res.status(200).json({ status: 200, message: inviteresponse.data.invitation_url });

  } catch (error) {
    console.log(error.response?.data || error.message, "error");
    return res.status(400).json({ status: 400, message: error.response?.data || error.message });
  }
};

export default createCandidates;
