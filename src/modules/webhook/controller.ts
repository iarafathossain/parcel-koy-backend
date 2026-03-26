import { Request, Response } from "express";
import Stripe from "stripe";
import { envVariables } from "../../config/env";
import { webhookServices } from "./service";

const stripe = new Stripe(envVariables.STRIPE.STRIPE_SECRET_KEY);

const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = envVariables.STRIPE.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    // CRITICAL: req.body MUST be a raw Buffer here, not a parsed JSON object!
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      endpointSecret,
    );
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        await webhookServices.processCheckoutSessionCompleted(session);
        break;

      // You can easily add more cases here later (e.g., payout.failed)
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error(`❌ Error processing webhook:`, error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

export const webhookControllers = {
  handleStripeWebhook,
};
