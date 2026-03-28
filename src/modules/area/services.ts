import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { getSlug } from "../../utils/get-slug";
import { QueryBuilder } from "../../utils/query-builder";
import { CreateAreaPayload, UpdateAreaPayload } from "./validators";

const normalizeAreaIncludeParam = (queryParams: IQueryParams): IQueryParams => {
  const includeParam = queryParams.include;

  if (!includeParam) {
    return queryParams;
  }

  const normalizedInclude = includeParam
    .split(",")
    .map((item) => item.trim())
    .flatMap((item) => {
      switch (item) {
        case "hubs":
          return ["hub"];
        case "parcels":
          return ["originParcels", "destinationParcels"];
        default:
          return [item];
      }
    })
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .join(",");

  return {
    ...queryParams,
    include: normalizedInclude,
  };
};

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
      isActive: payload.isActive ?? true,
      slug,
      zoneId: payload.zoneId,
      hubID: payload.hubId,
    },
  });

  return area;
};

const getAllAreas = async (queryParams: IQueryParams) => {
  const normalizedQueryParams = normalizeAreaIncludeParam(queryParams);

  const queryBuilder = new QueryBuilder(prisma.area, normalizedQueryParams, {
    searchableFields: [
      "name",
      "slug",
      "zone.name",
      "zone.slug",
      "hub.name",
      "hub.slug",
    ],
    filterableFields: [
      "name",
      "slug",
      "zoneId",
      "zone.slug",
      "hub.id",
      "hub.slug",
    ],
  })
    .search()
    .filter()
    .sort()
    .fields()
    .dynamicInclude(
      {
        zone: true,
        hub: true,
        originParcels: true,
        destinationParcels: true,
        merchants: true,
      },
      ["zone", "hub"],
    )
    .paginate();

  return await queryBuilder.execute();
};

const getAreaBySlug = async (slug: string, queryParams: IQueryParams) => {
  const normalizedQueryParams = normalizeAreaIncludeParam(queryParams);

  const queryBuilder = new QueryBuilder(prisma.area, normalizedQueryParams)
    .where({ slug })
    .fields()
    .dynamicInclude(
      {
        zone: true,
        hub: true,
        originParcels: true,
        destinationParcels: true,
        merchants: true,
      },
      ["zone", "hub"],
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

  if (payload.hubId) {
    updateData.hubID = payload.hubId;
  }

  if (payload.isActive !== undefined) {
    updateData.isActive = payload.isActive;
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
