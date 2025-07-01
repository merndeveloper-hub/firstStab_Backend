//3. Later: Add Admin Endpoint to Capture the Authorized Payment

const captureAuthorizedPayment = async (req, res) => {
  try {
    const { authorizationId } = req.body; // Pass from frontend/admin panel
    const getToken = await getAccessToken();

    const captureRes = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/payments/authorizations/${authorizationId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${getToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Payment Captured:", captureRes.data);
    return res.status(200).json({ status: "success", data: captureRes.data });

  } catch (error) {
    console.error("Capture Error:", error.response ? error.response.data : error.message);
    return res.status(400).json({ status: "failed", message: error.message });
  }
};
