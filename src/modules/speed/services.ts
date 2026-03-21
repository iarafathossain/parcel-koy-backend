import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { getSlug } from "../../utils/get-slug";
import { QueryBuilder } from "../../utils/query-builder";
import { CreateSpeedPayload, UpdateSpeedPayload } from "./validators";

const createSpeed = async (payload: CreateSpeedPayload) => {
  const slug = getSlug(payload.name);

  // validate if speed with same slug already exists
  const existingSpeed = await prisma.speed.findUnique({
    where: {
      slug,
    },
  });

  if (existingSpeed) {
    throw new AppError(
      status.BAD_REQUEST,
      "A speed with the same name already exists",
    );
  }

  const speed = await prisma.speed.create({
    data: {
      name: payload.name,
      slug,
      description: payload.description,
      baseFee: payload.baseFee,
      slaHours: payload.slaHours,
      isActive: payload.isActive,
    },
  });

  return speed;
};

const getAllSpeeds = async (queryParams: IQueryParams) => {
  const listQueryParams: IQueryParams = {
    ...queryParams,
    sortBy: queryParams.sortBy ?? "name",
    sortOrder: queryParams.sortOrder ?? "asc",
  };

  const queryBuilder = new QueryBuilder(prisma.speed, listQueryParams, {
    searchableFields: ["name", "slug", "description"],
    filterableFields: ["name", "slug", "slaHours", "baseFee", "isActive"],
  })
    .search()
    .filter()
    .sort()
    .fields()
    .dynamicInclude(
      {
        pricingRules: true,
        parcels: true,
      },
      [],
    )
    .paginate();

  return await queryBuilder.execute();
};

const getSpeedBySlug = async (slug: string, queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.speed, queryParams)
    .where({ slug })
    .fields()
    .dynamicInclude(
      {
        pricingRules: true,
        parcels: true,
      },
      [],
    );

  const speeds = await prisma.speed.findMany(
    queryBuilder.getQuery() as Parameters<typeof prisma.speed.findMany>[0],
  );

  return speeds[0] ?? null;
};

const updateSpeed = async (slug: string, payload: UpdateSpeedPayload) => {
  const updateData: Record<string, unknown> = {};

  if (payload.name) {
    updateData.name = payload.name;
    updateData.slug = getSlug(payload.name);
  }

  if (payload.description !== undefined) {
    updateData.description = payload.description;
  }

  if (payload.baseFee !== undefined) {
    updateData.baseFee = payload.baseFee;
  }

  if (payload.slaHours !== undefined) {
    updateData.slaHours = payload.slaHours;
  }

  if (payload.isActive !== undefined) {
    updateData.isActive = payload.isActive;
  }

  const speed = await prisma.speed.update({
    where: {
      slug,
    },
    data: updateData,
  });

  return speed;
};

const deleteSpeed = async (slug: string) => {
  // validate if speed exists before attempting to delete
  const existingSpeed = await prisma.speed.findUnique({
    where: {
      slug,
    },
  });

  if (!existingSpeed) {
    throw new AppError(status.NOT_FOUND, "Speed not found");
  }

  const speed = await prisma.speed.delete({
    where: {
      slug,
    },
  });

  return speed;
};

export const speedServices = {
  createSpeed,
  getAllSpeeds,
  getSpeedBySlug,
  updateSpeed,
  deleteSpeed,
};
