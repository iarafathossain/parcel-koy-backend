import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { QueryBuilder } from "../../utils/query-builder";
import {
  CreatePricingRulePayload,
  UpdatePricingRulePayload,
} from "./validators";

const createPricing = async (payload: CreatePricingRulePayload) => {
  // Validate that min weight is less than max weight
  if (payload.minWeight >= payload.maxWeight) {
    throw new AppError(
      status.BAD_REQUEST,
      "Min weight must be less than max weight",
    );
  }

  // Validate that zones exist
  const originalZone = await prisma.zone.findUnique({
    where: { id: payload.originalZoneId },
  });

  if (!originalZone) {
    throw new AppError(status.NOT_FOUND, "Original zone not found");
  }

  const destinationZone = await prisma.zone.findUnique({
    where: { id: payload.destinationZoneId },
  });

  if (!destinationZone) {
    throw new AppError(status.NOT_FOUND, "Destination zone not found");
  }

  // Validate that speed exists
  const speed = await prisma.speed.findUnique({
    where: { id: payload.speedId },
  });

  if (!speed) {
    throw new AppError(status.NOT_FOUND, "Speed type not found");
  }

  // ensure price is >= speed base fee
  if (payload.price < Number(speed.baseFee)) {
    throw new AppError(
      status.BAD_REQUEST,
      `Price must be greater than or equal to speed[${speed.slug}] base fee of ${speed.baseFee}`,
    );
  }

  // Validate that method exists
  const method = await prisma.method.findUnique({
    where: { id: payload.methodId },
  });

  if (!method) {
    throw new AppError(status.NOT_FOUND, "Delivery method not found");
  }

  // ensure price is >= method base fee
  if (payload.price < Number(method.baseFee)) {
    throw new AppError(
      status.BAD_REQUEST,
      `Price must be greater than or equal to method[${method.slug}] base fee of ${method.baseFee}`,
    );
  }

  // prevent express delivery for outside dhaka
  if (
    speed.slug === "express-delivery" &&
    destinationZone.slug === "outside-dhaka"
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Express delivery is only available for deliveries within Dhaka",
    );
  }

  // Validate that category exists
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  // ensure price is >= category base fee
  if (payload.price < Number(category.baseFee)) {
    throw new AppError(
      status.BAD_REQUEST,
      `Price must be greater than or equal to category[${category.slug}] base fee of ${category.baseFee}`,
    );
  }

  // ensure minWeight is >= category base weight
  if (payload.minWeight < category.baseWeight) {
    throw new AppError(
      status.BAD_REQUEST,
      `Min weight must be greater than or equal to category[${category.slug}] base weight of ${category.baseWeight}`,
    );
  }

  // ensure price is >= service base fee
  if (payload.price < Number(speed.baseFee)) {
    throw new AppError(
      status.BAD_REQUEST,
      `Price must be greater than or equal to speed[${speed.slug}] base fee of ${speed.baseFee}`,
    );
  }

  // prevent duplicate pricing rules for the same zone, category, speed, and method combination
  const duplicateCheck = await prisma.pricing.findFirst({
    where: {
      originalZoneId: payload.originalZoneId,
      destinationZoneId: payload.destinationZoneId,
      categoryId: payload.categoryId,
      speedId: payload.speedId,
      methodId: payload.methodId,
    },
  });

  if (duplicateCheck) {
    throw new AppError(
      status.BAD_REQUEST,
      "A pricing rule with the same zone, category, speed, and method combination already exists",
    );
  }

  const pricing = await prisma.pricing.create({
    data: {
      originalZoneId: payload.originalZoneId,
      destinationZoneId: payload.destinationZoneId,
      categoryId: payload.categoryId,
      speedId: payload.speedId,
      methodId: payload.methodId,
      minWeight: payload.minWeight,
      maxWeight: payload.maxWeight,
      price: payload.price,
    },
    include: {
      originalZone: true,
      destinationZone: true,
      category: true,
      speed: true,
      method: true,
    },
  });

  return pricing;
};

const getAllPricing = async (queryParams: IQueryParams) => {
  const listQueryParams: IQueryParams = {
    ...queryParams,
    sortBy: queryParams.sortBy ?? "createdAt",
    sortOrder: queryParams.sortOrder ?? "desc",
  };

  const queryBuilder = new QueryBuilder(prisma.pricing, listQueryParams, {
    searchableFields: [
      "originalZone.name",
      "destinationZone.name",
      "speed.name",
      "category.name",
    ],
    filterableFields: [
      "originalZoneId",
      "destinationZoneId",
      "categoryId",
      "speedId",
      "minWeight",
      "maxWeight",
      "price",
      "methodId",
    ],
  })
    .search()
    .filter()
    .sort()
    .fields()
    .dynamicInclude(
      {
        originalZone: true,
        destinationZone: true,
        category: true,
        speed: true,
        method: true,
      },
      ["originalZone", "destinationZone", "speed", "category", "method"],
    )
    .paginate();

  return await queryBuilder.execute();
};

const getPricingById = async (id: string, queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.pricing, queryParams)
    .where({ id })
    .fields()
    .dynamicInclude(
      {
        originalZone: true,
        destinationZone: true,
        category: true,
        speed: true,
        method: true,
      },
      ["originalZone", "destinationZone", "speed", "category", "method"],
    );

  const pricing = await prisma.pricing.findMany(
    queryBuilder.getQuery() as Parameters<typeof prisma.pricing.findMany>[0],
  );

  return pricing[0] ?? null;
};

const updatePricing = async (id: string, payload: UpdatePricingRulePayload) => {
  const updateData: Record<string, unknown> = {};

  const existingPricing = await prisma.pricing.findUnique({
    where: { id },
    include: {
      speed: true,
      category: true,
    },
  });

  if (!existingPricing) {
    throw new AppError(status.NOT_FOUND, "Pricing rule not found");
  }

  if (payload.minWeight !== undefined) {
    // ensure minWeight is >= category base weight
    if (payload.minWeight < existingPricing.category.baseWeight) {
      throw new AppError(
        status.BAD_REQUEST,
        `Min weight must be greater than or equal to category base weight of ${existingPricing.category.baseWeight}`,
      );
    }
    updateData.minWeight = payload.minWeight;
  }

  if (payload.maxWeight !== undefined) {
    updateData.maxWeight = payload.maxWeight;
  }

  // Validate min < max if both are being updated
  if (
    payload.minWeight !== undefined &&
    payload.maxWeight !== undefined &&
    payload.minWeight >= payload.maxWeight
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Min weight must be less than max weight",
    );
  }

  if (payload.price !== undefined) {
    // ensure price is >= service base fee
    if (payload.price < Number(existingPricing.speed.baseFee)) {
      throw new AppError(
        status.BAD_REQUEST,
        `Price must be greater than or equal to speed base fee of ${existingPricing.speed.baseFee}`,
      );
    }
    updateData.price = payload.price;
  }

  if (payload.originalZoneId) {
    const zone = await prisma.zone.findUnique({
      where: { id: payload.originalZoneId },
    });

    if (!zone) {
      throw new AppError(status.NOT_FOUND, "Original zone not found");
    }

    updateData.originalZoneId = payload.originalZoneId;
  }

  if (payload.destinationZoneId) {
    const zone = await prisma.zone.findUnique({
      where: { id: payload.destinationZoneId },
    });

    if (!zone) {
      throw new AppError(status.NOT_FOUND, "Destination zone not found");
    }

    updateData.destinationZoneId = payload.destinationZoneId;
  }

  if (payload.speedId) {
    const speed = await prisma.speed.findUnique({
      where: { id: payload.speedId },
    });

    if (!speed) {
      throw new AppError(status.NOT_FOUND, "Speed not found");
    }

    updateData.speedId = payload.speedId;
  }

  if (payload.categoryId !== undefined) {
    if (payload.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: payload.categoryId },
      });

      if (!category) {
        throw new AppError(status.NOT_FOUND, "Category not found");
      }
    }

    updateData.categoryId = payload.categoryId;
  }

  if (payload.methodId !== undefined) {
    if (payload.methodId) {
      const method = await prisma.method.findUnique({
        where: { id: payload.methodId },
      });

      if (!method) {
        throw new AppError(status.NOT_FOUND, "Method not found");
      }
    }

    updateData.methodId = payload.methodId;
  }

  const pricingRule = await prisma.pricing.update({
    where: { id },
    data: updateData,
    include: {
      originalZone: true,
      destinationZone: true,
      category: true,
      speed: true,
      method: true,
    },
  });

  return pricingRule;
};

const deletePricing = async (id: string) => {
  // Validate if pricing rule exists before attempting to delete
  const existingPricingRule = await prisma.pricing.findUnique({
    where: { id },
  });

  if (!existingPricingRule) {
    throw new AppError(status.NOT_FOUND, "Pricing rule not found");
  }

  const pricingRule = await prisma.pricing.delete({
    where: { id },
  });

  return pricingRule;
};

export const pricingServices = {
  createPricing,
  getAllPricing,
  getPricingById,
  updatePricing,
  deletePricing,
};
