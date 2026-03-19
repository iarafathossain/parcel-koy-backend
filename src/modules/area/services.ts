import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { getSlug } from "../../utils/get-slug";
import { QueryBuilder } from "../../utils/query-builder";
import { CreateAreaPayload, UpdateAreaPayload } from "./validators";

const createArea = async (payload: CreateAreaPayload) => {
  const slug = getSlug(payload.name);

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
