//4. Optional: Add Admin Endpoint to Void Authorization
//If you want to cancel the hold, do this:


//POST /v2/payments/authorizations/{authorization_id}/void

const voidAuthorization = async (req, res) => {
  try {
    const { authorizationId } = req.body;
    const getToken = await getAccessToken();

    const voidRes = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/payments/authorizations/${authorizationId}/void`,
      {},
      {
        headers: {
          Authorization: `Bearer ${getToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({ status: "voided", data: voidRes.data });
  } catch (error) {
    console.error("Void Error:", error.response ? error.response.data : error.message);
    return res.status(400).json({ status: "failed", message: error.message });
  }
};
