import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { getSlug } from "../../utils/get-slug";
import { QueryBuilder } from "../../utils/query-builder";
import { CreateServicePayload, UpdateServicePayload } from "./validators";

const createService = async (payload: CreateServicePayload) => {
  const slug = getSlug(payload.name);

  const service = await prisma.service.create({
    data: {
      name: payload.name,
      slug,
      description: payload.description,
      baseFee: payload.baseFee,
      slaHours: payload.slaHours,
      isActive: payload.isActive,
    },
  });

  return service;
};

const getAllServices = async (queryParams: IQueryParams) => {
  const listQueryParams: IQueryParams = {
    ...queryParams,
    sortBy: queryParams.sortBy ?? "name",
    sortOrder: queryParams.sortOrder ?? "asc",
  };

  const queryBuilder = new QueryBuilder(prisma.service, listQueryParams, {
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

const getServiceBySlug = async (slug: string, queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.service, queryParams)
    .where({ slug })
    .fields()
    .dynamicInclude(
      {
        pricingRules: true,
        parcels: true,
      },
      [],
    );

  const services = await prisma.service.findMany(
    queryBuilder.getQuery() as Parameters<typeof prisma.service.findMany>[0],
  );

  return services[0] ?? null;
};

const updateService = async (slug: string, payload: UpdateServicePayload) => {
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

  const service = await prisma.service.update({
    where: {
      slug,
    },
    data: updateData,
  });

  return service;
};

const deleteService = async (slug: string) => {
  // validate if service exists before attempting to delete
  const existingService = await prisma.service.findUnique({
    where: {
      slug,
    },
  });

  if (!existingService) {
    throw new AppError(status.NOT_FOUND, "Service not found");
  }

  const service = await prisma.service.delete({
    where: {
      slug,
    },
  });

  return service;
};

export const serviceService = {
  createService,
  getAllServices,
  getServiceBySlug,
  updateService,
  deleteService,
};
