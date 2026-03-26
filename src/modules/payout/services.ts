import Stripe from "stripe";
import { envVariables } from "../../config/env";
import { Prisma } from "../../generated/prisma/client";
import {
  PaymentProviderType,
  PayoutStatus,
} from "../../generated/prisma/enums";
import { prisma } from "../../libs/prisma";

const stripe = new Stripe(envVariables.STRIPE.STRIPE_SECRET_KEY);

const getPayoutIdFromMetadata = (
  metadata: Record<string, string> | null | undefined,
) => {
  if (!metadata) {
    return null;
  }

  return (
    metadata.payoutId ?? metadata.paymentId ?? metadata.withdrawalId ?? null
  );
};

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  const existingProcessedEvent = await prisma.payout.findFirst({
    where: {
      stripeEventId: event.id,
    },
    select: {
      id: true,
    },
  });

  if (existingProcessedEvent) {
    return {
      message: `Stripe event ${event.id} already processed. Skipping.`,
      payoutId: existingProcessedEvent.id,
    };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const payoutId = getPayoutIdFromMetadata(session.metadata);

      if (!payoutId) {
        return {
          message:
            "No payout ID found in checkout session metadata. Event skipped.",
        };
      }

      const payout = await prisma.payout.findUnique({
        where: { id: payoutId },
        select: { id: true, status: true },
      });

      if (!payout) {
        return {
          message: `No payout found with ID ${payoutId}. Event skipped.`,
        };
      }

      if (payout.status === PayoutStatus.COMPLETED) {
        return {
          message: `Payout ${payoutId} is already completed. Skipping update.`,
          payoutId,
        };
      }

      const nextStatus =
        session.payment_status === "paid"
          ? PayoutStatus.COMPLETED
          : PayoutStatus.REJECTED;

      await prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: nextStatus,
          stripeEventId: event.id,
          transactionId:
            session.payment_intent && typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.id,
          paymentMethod: "STRIPE",
          paymentGatewayData: session as unknown as Prisma.InputJsonValue,
        },
      });

      return {
        message: `Payout ${payoutId} updated to ${nextStatus}.`,
        payoutId,
      };
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const payoutId = getPayoutIdFromMetadata(session.metadata);

      if (!payoutId) {
        return {
          message:
            "No payout ID found in expired checkout session metadata. Event skipped.",
        };
      }

      const payout = await prisma.payout.findUnique({
        where: { id: payoutId },
        select: { id: true, status: true, amount: true, merchantId: true },
      });

      if (!payout) {
        return {
          message: `No payout found with ID ${payoutId}. Event skipped.`,
        };
      }

      if (payout.status !== PayoutStatus.PENDING) {
        return {
          message: `Payout ${payoutId} is not pending. Skipping rollback.`,
          payoutId,
        };
      }

      await prisma.$transaction(async (tx) => {
        await tx.payout.update({
          where: { id: payoutId },
          data: {
            status: PayoutStatus.REJECTED,
            stripeEventId: event.id,
            transactionId: session.id,
            paymentMethod: "STRIPE",
            paymentGatewayData: session as unknown as Prisma.InputJsonValue,
            adminNote: "Stripe checkout session expired.",
          },
        });

        await tx.merchant.update({
          where: { id: payout.merchantId },
          data: {
            balance: {
              increment: payout.amount,
            },
          },
        });
      });

      return {
        message: `Payout ${payoutId} rejected and balance restored.`,
        payoutId,
      };
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const payoutId = getPayoutIdFromMetadata(paymentIntent.metadata);

      if (!payoutId) {
        return {
          message:
            "No payout ID found in payment intent metadata. Event skipped.",
        };
      }

      const payout = await prisma.payout.findUnique({
        where: { id: payoutId },
        select: { id: true, status: true, amount: true, merchantId: true },
      });

      if (!payout) {
        return {
          message: `No payout found with ID ${payoutId}. Event skipped.`,
        };
      }

      if (payout.status !== PayoutStatus.PENDING) {
        return {
          message: `Payout ${payoutId} is not pending. Skipping rollback.`,
          payoutId,
        };
      }

      await prisma.$transaction(async (tx) => {
        await tx.payout.update({
          where: { id: payoutId },
          data: {
            status: PayoutStatus.REJECTED,
            stripeEventId: event.id,
            transactionId: paymentIntent.id,
            paymentMethod: "STRIPE",
            paymentGatewayData:
              paymentIntent as unknown as Prisma.InputJsonValue,
            adminNote: "Stripe payment intent failed.",
          },
        });

        await tx.merchant.update({
          where: { id: payout.merchantId },
          data: {
            balance: {
              increment: payout.amount,
            },
          },
        });
      });

      return {
        message: `Payout ${payoutId} rejected and balance restored.`,
        payoutId,
      };
    }

    default:
      return {
        message: `Unhandled Stripe event type: ${event.type}`,
      };
  }
};

const createStripeCheckoutSessionForPayout = async (
  payoutId: string,
  payload: {
    successUrl?: string;
    cancelUrl?: string;
  },
) => {
  const payout = await prisma.payout.findUnique({
    where: {
      id: payoutId,
    },
    include: {
      merchant: {
        include: {
          user: true,
        },
      },
      paymentAccount: true,
    },
  });

  if (!payout) {
    throw new Error("Payout not found");
  }

  if (payout.status !== PayoutStatus.PENDING) {
    throw new Error("Only pending payouts can be processed with Stripe");
  }

  if (!payout.paymentAccount.isActive) {
    throw new Error("Payment account is inactive");
  }

  if (payout.paymentAccount.providerType !== PaymentProviderType.STRIPE) {
    throw new Error("Selected payment account is not a Stripe account");
  }

  const amountInSmallestUnit = Math.round(Number(payout.amount) * 100);

  if (amountInSmallestUnit <= 0) {
    throw new Error("Payout amount must be greater than zero");
  }

  const successUrl =
    payload.successUrl ??
    `${envVariables.FRONTEND_URL}/admin/payouts/success?payoutId=${payout.id}`;
  const cancelUrl =
    payload.cancelUrl ??
    `${envVariables.FRONTEND_URL}/admin/payouts/cancel?payoutId=${payout.id}`;

  const checkoutSessionPayload: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "bdt",
          unit_amount: amountInSmallestUnit,
          product_data: {
            name: `Merchant payout - ${payout.merchant.businessName}`,
            description: `Payout ID: ${payout.id}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      payoutId: payout.id,
      merchantId: payout.merchantId,
      paymentAccountId: payout.paymentAccountId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  };

  const fallbackEmail =
    payout.paymentAccount.billingEmail ?? payout.merchant.user.email;

  if (payout.paymentAccount.stripeCustomerId) {
    checkoutSessionPayload.customer = payout.paymentAccount.stripeCustomerId;
  } else {
    if (!fallbackEmail) {
      throw new Error(
        "No Stripe customer ID or fallback email found for checkout session",
      );
    }

    checkoutSessionPayload.customer_email = fallbackEmail;
  }

  let checkoutSession: Stripe.Checkout.Session;

  try {
    checkoutSession = await stripe.checkout.sessions.create(
      checkoutSessionPayload,
    );
  } catch (error: unknown) {
    const stripeError = error as Stripe.StripeRawError & {
      code?: string;
      param?: string;
      type?: string;
    };

    const isMissingCustomerError =
      stripeError?.type === "invalid_request_error" &&
      stripeError?.code === "resource_missing" &&
      stripeError?.param === "customer";

    if (!isMissingCustomerError) {
      throw error;
    }

    if (!fallbackEmail) {
      throw new Error(
        "Stripe customer is invalid and no fallback email is available",
      );
    }

    const createdCustomer = await stripe.customers.create({
      email: fallbackEmail,
      name: payout.merchant.user.name,
      metadata: {
        merchantId: payout.merchantId,
        paymentAccountId: payout.paymentAccountId,
      },
    });

    await prisma.paymentAccount.update({
      where: {
        id: payout.paymentAccountId,
      },
      data: {
        stripeCustomerId: createdCustomer.id,
        billingEmail: payout.paymentAccount.billingEmail ?? fallbackEmail,
      },
    });

    checkoutSessionPayload.customer = createdCustomer.id;
    delete checkoutSessionPayload.customer_email;

    checkoutSession = await stripe.checkout.sessions.create(
      checkoutSessionPayload,
    );
  }

  await prisma.payout.update({
    where: {
      id: payout.id,
    },
    data: {
      transactionId: checkoutSession.id,
      paymentMethod: "STRIPE",
      paymentGatewayData: checkoutSession as unknown as Prisma.InputJsonValue,
    },
  });

  return {
    payoutId: payout.id,
    checkoutSessionId: checkoutSession.id,
    checkoutUrl: checkoutSession.url,
    status: payout.status,
  };
};

export const payoutService = {
  handleStripeWebhookEvent,
  createStripeCheckoutSessionForPayout,
};
