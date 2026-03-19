import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { getSlug } from "../../utils/get-slug";
import { QueryBuilder } from "../../utils/query-builder";
import { CreateHubPayload, UpdateHubPayload } from "./validators";

const createHub = async (payload: CreateHubPayload) => {
  const slug = getSlug(payload.name);

  const hub = await prisma.hub.create({
    data: {
      name: payload.name,
      slug,
      address: payload.address,
      contactNumber: payload.contactNumber,
      areaId: payload.areaId,
      managerId: payload.managerId ?? undefined,
    },
    include: {
      area: true,
      manager: true,
    },
  });

  return hub;
};

const getAllHubs = async (queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.hub, queryParams, {
    searchableFields: ["name", "slug", "address", "contactNumber", "area.name"],
    filterableFields: ["name", "slug", "areaId", "area.slug"],
  })
    .search()
    .filter()
    .sort()
    .fields()
    .dynamicInclude(
      {
        area: true,
        manager: true,
      },
      ["area", "manager"],
    )
    .paginate();

  return await queryBuilder.execute();
};

const getHubBySlug = async (slug: string, queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.hub, queryParams)
    .where({ slug })
    .fields()
    .dynamicInclude(
      {
        area: true,
        manager: true,
      },
      ["area", "manager"],
    );

  const hubs = await prisma.hub.findMany(
    queryBuilder.getQuery() as Parameters<typeof prisma.hub.findMany>[0],
  );

  return hubs[0] ?? null;
};

const updateHub = async (slug: string, payload: UpdateHubPayload) => {
  const updateData: Record<string, unknown> = {};

  if (payload.name) {
    updateData.name = payload.name;
    updateData.slug = getSlug(payload.name);
  }

  if (payload.address) {
    updateData.address = payload.address;
  }

  if (payload.contactNumber) {
    updateData.contactNumber = payload.contactNumber;
  }

  if (payload.areaId) {
    updateData.areaId = payload.areaId;
  }

  if (payload.managerId !== undefined) {
    updateData.managerId = payload.managerId;
  }

  const hub = await prisma.hub.update({
    where: {
      slug,
    },
    data: updateData,
    include: {
      area: true,
      manager: true,
    },
  });

  return hub;
};

const deleteHub = async (slug: string) => {
  const hub = await prisma.hub.delete({
    where: {
      slug,
    },
  });

  return hub;
};

export const hubService = {
  createHub,
  getAllHubs,
  getHubBySlug,
  updateHub,
  deleteHub,
};
