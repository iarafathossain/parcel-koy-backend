import status from "http-status";
import AppError from "../../errors/app-error";
import { IRequestUser } from "../../interfaces/auth-type";
import { prisma } from "../../libs/prisma";
import {
  AddPaymentAccountPayload,
  UpdatePaymentAccountPayload,
} from "./validators";

const BANK_PROVIDER = "BANK";
const STRIPE_PROVIDER = "STRIPE";

const ensureMerchantOrAdmin = (currentUser: IRequestUser) => {
  if (currentUser.role !== "MERCHANT" && currentUser.role !== "ADMIN") {
    throw new AppError(
      status.FORBIDDEN,
      "Only merchant and admin can manage payment accounts",
    );
  }
};

const resolveMerchantIdForAdd = async (
  payload: AddPaymentAccountPayload,
  currentUser: IRequestUser,
) => {
  if (currentUser.role === "MERCHANT") {
    const merchant = await prisma.merchant.findUnique({
      where: {
        userId: currentUser.userId,
      },
      select: {
        id: true,
      },
    });

    if (!merchant) {
      throw new AppError(status.NOT_FOUND, "Merchant profile not found");
    }

    return merchant.id;
  }

  if (!payload.merchantId) {
    throw new AppError(status.BAD_REQUEST, "merchantId is required for admin");
  }

  const merchant = await prisma.merchant.findUnique({
    where: {
      id: payload.merchantId,
    },
    select: {
      id: true,
    },
  });

  if (!merchant) {
    throw new AppError(status.NOT_FOUND, "Merchant not found");
  }

  return merchant.id;
};

const resolveAccountForActor = async (
  paymentAccountId: string,
  currentUser: IRequestUser,
) => {
  if (currentUser.role === "MERCHANT") {
    const merchant = await prisma.merchant.findUnique({
      where: {
        userId: currentUser.userId,
      },
      select: {
        id: true,
      },
    });

    if (!merchant) {
      throw new AppError(status.NOT_FOUND, "Merchant profile not found");
    }

    const account = await prisma.paymentAccount.findFirst({
      where: {
        id: paymentAccountId,
        merchantId: merchant.id,
      },
    });

    if (!account) {
      throw new AppError(status.NOT_FOUND, "Payment account not found");
    }

    return account;
  }

  const account = await prisma.paymentAccount.findUnique({
    where: {
      id: paymentAccountId,
    },
  });

  if (!account) {
    throw new AppError(status.NOT_FOUND, "Payment account not found");
  }

  return account;
};

const addPaymentAccount = async (
  payload: AddPaymentAccountPayload,
  currentUser: IRequestUser,
) => {
  ensureMerchantOrAdmin(currentUser);

  const merchantId = await resolveMerchantIdForAdd(payload, currentUser);

  const isStripeProvider = payload.providerType === STRIPE_PROVIDER;

  if (isStripeProvider && !payload.stripePaymentMethodId) {
    throw new AppError(
      status.BAD_REQUEST,
      "stripePaymentMethodId is required for STRIPE provider",
    );
  }

  if (isStripeProvider && !payload.stripeCustomerId) {
    throw new AppError(
      status.BAD_REQUEST,
      "stripeCustomerId is required for STRIPE provider",
    );
  }

  if (!isStripeProvider && !payload.accountNumber) {
    throw new AppError(
      status.BAD_REQUEST,
      "accountNumber is required for non-STRIPE providers",
    );
  }

  const resolvedAccountNumber = isStripeProvider
    ? (payload.accountNumber ??
      payload.cardLast4 ??
      payload.stripePaymentMethodId)
    : payload.accountNumber;

  const existing = isStripeProvider
    ? await prisma.paymentAccount.findFirst({
        where: {
          merchantId,
          stripePaymentMethodId: payload.stripePaymentMethodId,
        } as any,
        select: {
          id: true,
        },
      })
    : await prisma.paymentAccount.findFirst({
        where: {
          merchantId,
          providerType: payload.providerType as any,
          accountNumber: resolvedAccountNumber,
        },
        select: {
          id: true,
        },
      });

  if (existing) {
    throw new AppError(
      status.CONFLICT,
      "This payment account already exists for the merchant",
    );
  }

  const hasDefault = await prisma.paymentAccount.findFirst({
    where: {
      merchantId,
      isDefault: true,
    },
    select: {
      id: true,
    },
  });

  const shouldBeDefault = payload.isDefault ?? !hasDefault;

  return await prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.paymentAccount.updateMany({
        where: {
          merchantId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return await tx.paymentAccount.create({
      data: {
        merchantId,
        providerType: payload.providerType as any,
        providerName: payload.providerName,
        accountName: payload.accountName,
        accountNumber: resolvedAccountNumber as string,
        branchName:
          payload.providerType === BANK_PROVIDER ? payload.branchName : null,
        routingNumber:
          payload.providerType === BANK_PROVIDER ? payload.routingNumber : null,
        stripeCustomerId: isStripeProvider ? payload.stripeCustomerId : null,
        stripePaymentMethodId: isStripeProvider
          ? payload.stripePaymentMethodId
          : null,
        stripePaymentMethodType: isStripeProvider
          ? (payload.stripePaymentMethodType ?? null)
          : null,
        cardBrand: isStripeProvider ? (payload.cardBrand ?? null) : null,
        cardLast4: isStripeProvider ? (payload.cardLast4 ?? null) : null,
        cardExpMonth: isStripeProvider ? (payload.cardExpMonth ?? null) : null,
        cardExpYear: isStripeProvider ? (payload.cardExpYear ?? null) : null,
        billingEmail: isStripeProvider ? (payload.billingEmail ?? null) : null,
        isDefault: shouldBeDefault,
      } as any,
    });
  });
};

const updatePaymentAccount = async (
  paymentAccountId: string,
  payload: UpdatePaymentAccountPayload,
  currentUser: IRequestUser,
) => {
  ensureMerchantOrAdmin(currentUser);

  const existing = await resolveAccountForActor(paymentAccountId, currentUser);
  const existingAccount = existing as any;

  const targetProviderType = payload.providerType ?? existing.providerType;
  const targetBranchName = payload.branchName ?? existingAccount.branchName;
  const targetRoutingNumber =
    payload.routingNumber ?? existingAccount.routingNumber;
  const targetStripeCustomerId =
    payload.stripeCustomerId ?? existingAccount.stripeCustomerId;
  const targetStripePaymentMethodId =
    payload.stripePaymentMethodId ?? existingAccount.stripePaymentMethodId;
  const targetAccountNumber =
    targetProviderType === STRIPE_PROVIDER
      ? (payload.accountNumber ??
        payload.cardLast4 ??
        existingAccount.cardLast4 ??
        payload.stripePaymentMethodId ??
        existingAccount.stripePaymentMethodId ??
        existing.accountNumber)
      : (payload.accountNumber ?? existing.accountNumber);

  if (
    targetProviderType === BANK_PROVIDER &&
    (!targetBranchName || !targetRoutingNumber)
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "branchName and routingNumber are required for BANK provider type",
    );
  }

  if (
    targetProviderType === STRIPE_PROVIDER &&
    (!targetStripeCustomerId || !targetStripePaymentMethodId)
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "stripeCustomerId and stripePaymentMethodId are required for STRIPE provider",
    );
  }

  const duplicate =
    targetProviderType === STRIPE_PROVIDER
      ? await prisma.paymentAccount.findFirst({
          where: {
            merchantId: existing.merchantId,
            stripePaymentMethodId: targetStripePaymentMethodId,
            id: {
              not: existing.id,
            },
          } as any,
          select: {
            id: true,
          },
        })
      : await prisma.paymentAccount.findFirst({
          where: {
            merchantId: existing.merchantId,
            providerType: targetProviderType as any,
            accountNumber: targetAccountNumber,
            id: {
              not: existing.id,
            },
          },
          select: {
            id: true,
          },
        });

  if (duplicate) {
    throw new AppError(
      status.CONFLICT,
      "Another payment account with the same provider and account number already exists",
    );
  }

  return await prisma.paymentAccount.update({
    where: {
      id: existing.id,
    },
    data: {
      providerType: payload.providerType as any,
      providerName: payload.providerName,
      accountName: payload.accountName,
      accountNumber: targetAccountNumber,
      branchName:
        targetProviderType === BANK_PROVIDER
          ? (payload.branchName ?? existingAccount.branchName)
          : null,
      routingNumber:
        targetProviderType === BANK_PROVIDER
          ? (payload.routingNumber ?? existingAccount.routingNumber)
          : null,
      stripeCustomerId:
        targetProviderType === STRIPE_PROVIDER ? targetStripeCustomerId : null,
      stripePaymentMethodId:
        targetProviderType === STRIPE_PROVIDER
          ? targetStripePaymentMethodId
          : null,
      stripePaymentMethodType:
        targetProviderType === STRIPE_PROVIDER
          ? (payload.stripePaymentMethodType ??
            existingAccount.stripePaymentMethodType ??
            null)
          : null,
      cardBrand:
        targetProviderType === STRIPE_PROVIDER
          ? (payload.cardBrand ?? existingAccount.cardBrand ?? null)
          : null,
      cardLast4:
        targetProviderType === STRIPE_PROVIDER
          ? (payload.cardLast4 ?? existingAccount.cardLast4 ?? null)
          : null,
      cardExpMonth:
        targetProviderType === STRIPE_PROVIDER
          ? (payload.cardExpMonth ?? existingAccount.cardExpMonth ?? null)
          : null,
      cardExpYear:
        targetProviderType === STRIPE_PROVIDER
          ? (payload.cardExpYear ?? existingAccount.cardExpYear ?? null)
          : null,
      billingEmail:
        targetProviderType === STRIPE_PROVIDER
          ? (payload.billingEmail ?? existingAccount.billingEmail ?? null)
          : null,
    } as any,
  });
};

const toggleActivePaymentAccount = async (
  paymentAccountId: string,
  currentUser: IRequestUser,
) => {
  ensureMerchantOrAdmin(currentUser);

  const existing = await resolveAccountForActor(paymentAccountId, currentUser);

  const nextActiveState = !existing.isActive;

  if (existing.isDefault && !nextActiveState) {
    throw new AppError(
      status.BAD_REQUEST,
      "Default payment account cannot be deactivated. Set another default account first",
    );
  }

  return await prisma.paymentAccount.update({
    where: {
      id: existing.id,
    },
    data: {
      isActive: nextActiveState,
    },
  });
};

const setDefaultPaymentAccount = async (
  paymentAccountId: string,
  currentUser: IRequestUser,
) => {
  ensureMerchantOrAdmin(currentUser);

  const existing = await resolveAccountForActor(paymentAccountId, currentUser);

  if (!existing.isActive) {
    throw new AppError(
      status.BAD_REQUEST,
      "Inactive payment account cannot be set as default",
    );
  }

  return await prisma.$transaction(async (tx) => {
    await tx.paymentAccount.updateMany({
      where: {
        merchantId: existing.merchantId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    return await tx.paymentAccount.update({
      where: {
        id: existing.id,
      },
      data: {
        isDefault: true,
      },
    });
  });
};

export const paymentAccountServices = {
  addPaymentAccount,
  updatePaymentAccount,
  toggleActivePaymentAccount,
  setDefaultPaymentAccount,
};
