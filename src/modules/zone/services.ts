import { prisma } from "../../libs/prisma";
import { getSlug } from "../../utils/get-slug";
import { CreateZonePayload, UpdateZonePayload } from "./validators";

const createZone = async (payload: CreateZonePayload) => {
  const slug = getSlug(payload.name);

  const zone = await prisma.zone.create({
    data: {
      name: payload.name,
      slug,
    },
  });

  return zone;
};

const getAllZones = async () => {
  const zones = await prisma.zone.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return zones;
};

const getZoneBySlug = async (slug: string) => {
  const zone = await prisma.zone.findUnique({
    where: {
      slug,
    },
  });

  return zone;
};

const updateZone = async (slug: string, payload: UpdateZonePayload) => {
  const updateData: Record<string, unknown> = {};

  if (payload.name) {
    updateData.name = payload.name;
    updateData.slug = getSlug(payload.name);
  }

  const zone = await prisma.zone.update({
    where: {
      slug,
    },
    data: updateData,
  });

  return zone;
};

const deleteZone = async (slug: string) => {
  const zone = await prisma.zone.delete({
    where: {
      slug,
    },
  });

  return zone;
};

export const zoneService = {
  createZone,
  getAllZones,
  getZoneBySlug,
  updateZone,
  deleteZone,
};
