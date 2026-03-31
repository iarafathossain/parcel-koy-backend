import Stripe from "stripe";
import { prisma } from "../../libs/prisma";

const processCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  console.log("Session metadata", session.metadata);
  // We only care about sessions created to clear a due balance
  if (session.metadata?.type !== "CLEAR_DUE") {
    return; // Ignore other types of checkout sessions
  }

  const merchantId = session.metadata.merchantId;
  if (!merchantId) return;

  if (session.payment_status === "paid") {
    const amountPaid = (session.amount_total || 0) / 100;

    console.log("amountPaid", amountPaid);

    await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        balance: { increment: amountPaid },
      },
    });

    console.log(
      `✅ Webhook: Added $${amountPaid} to merchant ${merchantId}'s balance`,
    );
  }
};

export const webhookServices = {
  processCheckoutSessionCompleted,
};
