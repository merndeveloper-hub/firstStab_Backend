// ==========================================
// 4. ONBOARDING RETURN CALLBACK
// ==========================================

const onboardingReturn = async (req, res) => {
  try {
    const { userId } = req.query;

    if (userId) {
      // Update user status
      const user = await findOne("user", { _id: userId });
      if (user && user.stripeAccountId) {
        const account = await stripe.accounts.retrieve(user.stripeAccountId);
        
        await updateOne("user", 
          { _id: userId }, 
          {
            stripeAccountStatus: account.charges_enabled ? "active" : "restricted",
            onboardingCompleteStripe: account.details_submitted
          }
        );
      }
    }

    return res.send(`
      <html>
        <head>
          <style>
            body { font-family: Arial; text-align: center; padding: 50px; }
            .success { color: #28a745; }
          </style>
        </head>
        <body>
          <h2 class="success">✅ Onboarding Complete!</h2>
          <p>Stripe account successfully setup.</p>
          <p>Redirecting...</p>
         
        </body>
      </html>
    `);

  } catch (e) {
    console.log(e);
    return res.status(400).send("Error completing onboarding");
  }
};

export default onboardingReturn;