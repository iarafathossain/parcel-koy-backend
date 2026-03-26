import status from "http-status";
import Stripe from "stripe";
import { envVariables } from "../../config/env";
import AppError from "../../errors/app-error";
import { IRequestUser } from "../../interfaces/auth-type";
import { prisma } from "../../libs/prisma";

const stripe = new Stripe(envVariables.STRIPE.STRIPE_SECRET_KEY);

const ensureMerchantOrAdmin = (currentUser: IRequestUser) => {
  if (currentUser.role !== "MERCHANT" && currentUser.role !== "ADMIN") {
    throw new AppError(
      status.FORBIDDEN,
      "Only merchant and admin can manage payment accounts",
    );
  }
};

const createStripeConnectOnboardingLink = async (
  currentUser: IRequestUser,
  successReturnUrl: string,
  refreshUrl: string,
) => {
  ensureMerchantOrAdmin(currentUser);

  const merchant = await prisma.merchant.findUnique({
    where: { userId: currentUser.userId },
    include: { user: true },
  });

  if (!merchant)
    throw new AppError(status.NOT_FOUND, "Merchant profile not found");

  let paymentAccount = await prisma.paymentAccount.findFirst({
    where: { merchantId: merchant.id },
  });

  let accountId: string;

  if (paymentAccount) {
    accountId = paymentAccount.stripeConnectAccountId;
  } else {
    // 1. Create the Connect Express account in Stripe
    const account = await stripe.accounts.create({
      type: "express",
      country: "US", // IMPORTANT: Use US or AE for testing if your Stripe account isn't approved for BD payouts yet
      email: merchant.user.email,
      capabilities: { transfers: { requested: true } },
      business_type: "company",
      company: { name: merchant.businessName },
    });

    accountId = account.id;

    // 2. Save the placeholder ID in your DB (inactive by default)
    await prisma.paymentAccount.create({
      data: {
        merchantId: merchant.id,
        providerType: "STRIPE",
        stripeConnectAccountId: accountId,
        isActive: false,
      },
    });
  }

  // 3. Generate the secure Stripe UI link
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: `${successReturnUrl}?accountId=${accountId}`,
    type: "account_onboarding",
  });

  return { url: accountLink.url };
};

const verifyStripeConnectAccount = async (
  currentUser: IRequestUser,
  accountId: string,
) => {
  ensureMerchantOrAdmin(currentUser);

  // 1. Ask Stripe if the user actually finished the form
  const account = await stripe.accounts.retrieve(accountId);

  if (!account.details_submitted || !account.charges_enabled) {
    throw new AppError(
      status.BAD_REQUEST,
      "Stripe onboarding is incomplete. Please finish setting up your account.",
    );
  }

  // 2. Mark the account as active and default so payouts can proceed
  await prisma.paymentAccount.update({
    where: { stripeConnectAccountId: accountId },
    data: {
      isActive: true,
      isDefault: true,
    },
  });

  return {
    success: true,
    message: "Stripe Connect account successfully verified and activated.",
  };
};

const createClearDueCheckout = async (
  currentUser: IRequestUser,
  successUrl: string,
  cancelUrl: string,
) => {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: currentUser.userId },
  });

  if (!merchant) throw new AppError(status.NOT_FOUND, "Merchant not found");

  const currentBalance = Number(merchant.balance);

  // If balance is 0 or positive, they don't owe anything
  if (currentBalance >= 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "You do not have any due balance to clear.",
    );
  }

  // Convert negative balance to positive absolute value, then to cents for Stripe
  const amountToPay = Math.abs(currentBalance);
  const amountInCents = Math.round(amountToPay * 100);

  // Create a Stripe Checkout Session where the platform collects the money
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd", // Make sure this matches your platform currency
          product_data: {
            name: "Clear Platform Due Balance",
            description: `Payment to clear negative balance for ${merchant.businessName}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    // {CHECKOUT_SESSION_ID} is a Stripe macro that will be replaced with the actual ID
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      merchantId: merchant.id,
      type: "CLEAR_DUE",
    },
  });

  return { url: session.url };
};

export const paymentAccountServices = {
  createStripeConnectOnboardingLink,
  verifyStripeConnectAccount,
  createClearDueCheckout,
};
