import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { getSlug } from "../../utils/get-slug";
import { QueryBuilder } from "../../utils/query-builder";
import { CreateCategoryPayload, UpdateCategoryPayload } from "./validators";

const createCategory = async (payload: CreateCategoryPayload) => {
  const slug = getSlug(payload.name);

  // validate if category with same slug already exists
  const existingCategory = await prisma.category.findUnique({
    where: {
      slug,
    },
  });

  if (existingCategory) {
    throw new AppError(
      status.BAD_REQUEST,
      "A category with the same name already exists",
    );
  }

  const category = await prisma.category.create({
    data: {
      name: payload.name,
      slug,
      baseWeight: payload.baseWeight,
      baseFee: payload.baseFee ?? undefined,
      isActive: payload.isActive ?? true,
    },
  });

  return category;
};

const getAllCategories = async (queryParams: IQueryParams) => {
  const listQueryParams: IQueryParams = {
    ...queryParams,
    sortBy: queryParams.sortBy ?? "name",
    sortOrder: queryParams.sortOrder ?? "asc",
  };

  const queryBuilder = new QueryBuilder(prisma.category, listQueryParams, {
    searchableFields: ["name", "slug"],
    filterableFields: ["name", "slug", "baseWeight", "isActive"],
  })
    .search()
    .filter()
    .sort()
    .fields()
    .dynamicInclude(
      {
        parcels: true,
        pricingRules: true,
      },
      [],
    )
    .paginate();

  return await queryBuilder.execute();
};

const getCategoryBySlug = async (slug: string, queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.category, queryParams)
    .where({ slug })
    .fields()
    .dynamicInclude(
      {
        parcels: true,
        pricingRules: true,
      },
      [],
    );

  const categories = await prisma.category.findMany(
    queryBuilder.getQuery() as Parameters<typeof prisma.category.findMany>[0],
  );

  return categories[0] ?? null;
};

const updateCategory = async (slug: string, payload: UpdateCategoryPayload) => {
  const updateData: Record<string, unknown> = {};

  if (payload.name) {
    updateData.name = payload.name;
    updateData.slug = getSlug(payload.name);
  }

  if (payload.baseWeight !== undefined) {
    updateData.baseWeight = payload.baseWeight;
  }

  if (payload.baseFee !== undefined) {
    updateData.baseFee = payload.baseFee;
  }

  if (payload.isActive !== undefined) {
    updateData.isActive = payload.isActive;
  }

  const category = await prisma.category.update({
    where: {
      slug,
    },
    data: updateData,
  });

  return category;
};

const deleteCategory = async (slug: string) => {
  // validate if category exists before attempting to delete
  const existingCategory = await prisma.category.findUnique({
    where: {
      slug,
    },
  });

  if (!existingCategory) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  const category = await prisma.category.delete({
    where: {
      slug,
    },
  });

  return category;
};

export const categoryServices = {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};
