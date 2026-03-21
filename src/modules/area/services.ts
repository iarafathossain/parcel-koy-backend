import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { getSlug } from "../../utils/get-slug";
import { QueryBuilder } from "../../utils/query-builder";
import { CreateAreaPayload, UpdateAreaPayload } from "./validators";

const createArea = async (payload: CreateAreaPayload) => {
  const slug = getSlug(payload.name);

  // validate if area with same slug already exists
  const existingArea = await prisma.area.findUnique({
    where: {
      slug,
    },
  });

  if (existingArea) {
    throw new AppError(
      status.BAD_REQUEST,
      "An area with the same name already exists",
    );
  }

  const area = await prisma.area.create({
    data: {
      name: payload.name,
      slug,
      zoneId: payload.zoneId,
    },
  });

  return area;
};

const getAllAreas = async (queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.area, queryParams, {
    searchableFields: ["name", "slug", "zone.name"],
    filterableFields: ["name", "slug", "zoneId", "zone.slug"],
  })
    .search()
    .filter()
    .sort()
    .fields()
    .dynamicInclude(
      {
        zone: true,
        hubs: true,
        parcels: true,
      },
      ["zone"],
    )
    .paginate();

  return await queryBuilder.execute();
};

const getAreaBySlug = async (slug: string, queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.area, queryParams)
    .where({ slug })
    .fields()
    .dynamicInclude(
      {
        zone: true,
        hubs: true,
        parcels: true,
      },
      ["zone"],
    );

  const areas = await prisma.area.findMany(
    queryBuilder.getQuery() as Parameters<typeof prisma.area.findMany>[0],
  );

  return areas[0] ?? null;
};

const updateArea = async (slug: string, payload: UpdateAreaPayload) => {
  const updateData: Record<string, unknown> = {};

  if (payload.name) {
    updateData.name = payload.name;
    updateData.slug = getSlug(payload.name);
  }

  if (payload.zoneId) {
    updateData.zoneId = payload.zoneId;
  }

  const area = await prisma.area.update({
    where: {
      slug,
    },
    data: updateData,
  });

  return area;
};

const deleteArea = async (slug: string) => {
  // validate if area exists before attempting to delete
  const existingArea = await prisma.area.findUnique({
    where: {
      slug,
    },
  });

  if (!existingArea) {
    throw new AppError(status.NOT_FOUND, "Area not found");
  }

  const area = await prisma.area.delete({
    where: {
      slug,
    },
  });

  return area;
};

export const areaService = {
  createArea,
  getAllAreas,
  getAreaBySlug,
  updateArea,
  deleteArea,
};
