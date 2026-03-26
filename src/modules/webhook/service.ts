import Stripe from "stripe";
import { prisma } from "../../libs/prisma";

const processCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  // We only care about sessions created to clear a due balance
  if (session.metadata?.type !== "CLEAR_DUE") {
    return; // Ignore other types of checkout sessions
  }

  const merchantId = session.metadata.merchantId;
  if (!merchantId) return;

  if (session.payment_status === "paid") {
    const amountPaid = (session.amount_total || 0) / 100;

    // Optional but recommended: Check if this session was already processed
    // to prevent duplicate balance increments if Stripe sends the webhook twice.
    // (You would need a `paymentIntentId` or `sessionId` column in a transactions table).

    await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        balance: { increment: amountPaid },
      },
    });

    console.log(
      `✅ Webhook: Cleared $${amountPaid} due for merchant ${merchantId}`,
    );
  }
};

export const webhookServices = {
  processCheckoutSessionCompleted,
};
