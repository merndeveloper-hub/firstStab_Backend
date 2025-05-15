import axios from 'axios';

const createCandidates = async (req, res) => {
  try {
    const data = {
      first_name: 'Jen',
      last_name: 'Moose',
      email: 'test@gmail.com',
      middle_name: 'Kasp',
      work_locations: [
        {
          country: 'US',
          state: 'CA',
          city: 'San Jose'
        }
      ]
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ZjQ5YzZhMGExODBiODk5ZmJlNTY2ZGQ1NDEyNThiZWE1MGQ4NDRhMjo=',
      }
    };

    const url = 'https://api.checkr-staging.com/v1/candidates/';
    const response = await axios.post(url, data, config);

 //   console.log(response.data, "response");
if(!response){
return res.status(400).json({ status: 400, message: error.response?.data || 'No candidate found' });
}

const inviteData = {
  candidate_id: 'cf053b97bd3288b38c16e548',
  work_locations: [
    {
      country: 'US',
      state: 'CA',
      city: 'San Jose'
    }
  ],
  package: 'basic_criminal_and_plv'
};

  const inviteconfig = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ZjQ5YzZhMGExODBiODk5ZmJlNTY2ZGQ1NDEyNThiZWE1MGQ4NDRhMjo=',
      }
    };

    const inviteurl = 'https://api.checkr-staging.com/v1/invitations';
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
