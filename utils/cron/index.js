import cron from "node-cron";
import axios from "axios";
import { updateDocument, find } from "../../helpers/index.js";
import getAccessToken from "../../routes/user/account/paymentMethod/accessToken.js";

async function pollPayout(payoutId, payout_batch_id) {
  let attempt = 0;
  const maxAttempts = 2;

  const interval = setInterval(async () => {
    attempt++;
    console.log(`🔄 Polling payout ${payoutId}, attempt ${attempt}`);

    const token = await getAccessToken();
    if (!token) {
      console.error("❌ PayPal token not available");
      clearInterval(interval);
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.PAYPAL_API_DEVELOPMENT_URL}/v1/payments/payouts/${payout_batch_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const batchStatus = response.data?.batch_header?.batch_status;
      console.log(`Payout ${payoutId} status:`, batchStatus);

      if (batchStatus === "SUCCESS") {
        await updateDocument("userPayment", payoutId, {
          status: "COMPLETED",
          updatedAt: new Date(),
        });
        console.log(`✅ Payout ${payoutId} completed`);
        clearInterval(interval);
        return;
      } else if (attempt >= maxAttempts) {
        console.log(
          `⚠️ Payout ${payoutId} did not complete after ${maxAttempts} attempts`
        );
        clearInterval(interval);
        return;
      }
    } catch (err) {
      console.error(
        `❌ Error checking payout ${payoutId}:`,
        err.response?.data || err.message
      );
      if (attempt >= maxAttempts) clearInterval(interval);
    }
  }, 2 * 60 * 1000); // 2 minutes
}

export default pollPayout;




