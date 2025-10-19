const onboardingReauth = async (req, res) => {
  try {
    const { userId } = req.query;

 await updateDocument(
      "user",
      { _id: userId },
      {
        stripeAccountId: account.id,
        stripeAccountStatus: "pending",
        // onboardingComplete: false
        onboardingCompleteStripe: true,
      }
    );

    return res.send(`
      <html>
        <head>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; }
            .warning { color: #ffc107; }
          </style>
        </head>
        <body>
          <h2 class="warning">⚠️ Link Expired</h2>
          <p>Onboarding link expire ho gaya hai.</p>
          <p>Redirecting to generate new link...</p>

        </body>
      </html>
    `);

  } catch (e) {
    console.log(e);
    return res.status(400).send("Error refreshing onboarding");
  }
};

export default onboardingReauth;