import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { getSlug } from "../../utils/get-slug";
import { QueryBuilder } from "../../utils/query-builder";
import { CreateMethodPayload, UpdateMethodPayload } from "./validators";

const createMethod = async (payload: CreateMethodPayload) => {
  const slug = getSlug(payload.name);

  // validate if method with same slug already exists
  const existingMethod = await prisma.method.findUnique({
    where: {
      slug,
    },
  });

  if (existingMethod) {
    throw new AppError(
      status.BAD_REQUEST,
      "A method with the same name already exists",
    );
  }

  const method = await prisma.method.create({
    data: {
      name: payload.name,
      slug,
      description: payload.description,
      baseFee: payload.baseFee,
    },
  });

  return method;
};

const getAllMethods = async (queryParams: IQueryParams) => {
  const listQueryParams: IQueryParams = {
    ...queryParams,
    sortBy: queryParams.sortBy ?? "name",
    sortOrder: queryParams.sortOrder ?? "asc",
  };

  const queryBuilder = new QueryBuilder(prisma.method, listQueryParams, {
    searchableFields: ["name", "slug", "description"],
    filterableFields: ["name", "slug", "baseFee"],
  })
    .search()
    .filter()
    .sort()
    .fields()
    .dynamicInclude(
      {
        pricing: true,
        parcels: true,
      },
      [],
    )
    .paginate();

  return await queryBuilder.execute();
};

const getMethodBySlug = async (slug: string, queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.method, queryParams)
    .where({ slug })
    .fields()
    .dynamicInclude(
      {
        pricing: true,
        parcels: true,
      },
      [],
    );

  const methods = await prisma.method.findMany(
    queryBuilder.getQuery() as Parameters<typeof prisma.method.findMany>[0],
  );

  return methods[0] ?? null;
};

const updateMethod = async (slug: string, payload: UpdateMethodPayload) => {
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

  const method = await prisma.method.update({
    where: {
      slug,
    },
    data: updateData,
  });

  return method;
};

const deleteMethod = async (slug: string) => {
  // validate if method exists before attempting to delete
  const existingMethod = await prisma.method.findUnique({
    where: {
      slug,
    },
  });

  if (!existingMethod) {
    throw new AppError(status.NOT_FOUND, "Method not found");
  }

  const method = await prisma.method.delete({
    where: {
      slug,
    },
  });

  return method;
};

export const methodServices = {
  createMethod,
  getAllMethods,
  getMethodBySlug,
  updateMethod,
  deleteMethod,
};
