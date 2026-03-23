import status from "http-status";
import AppError from "../../errors/app-error";
import { prisma } from "../../libs/prisma";
import { CreateNotePayload, UpdateNotePayload } from "./validators";

const addNote = async (payload: CreateNotePayload, userId: string) => {
  const parcel = await prisma.parcel.findUnique({
    where: { id: payload.parcelId },
    select: { id: true },
  });

  if (!parcel) {
    throw new AppError(status.NOT_FOUND, "Parcel not found");
  }

  const note = await prisma.note.create({
    data: {
      parcelId: payload.parcelId,
      text: payload.text,
      createdById: userId,
    },
  });

  return note;
};

const updateNote = async (noteId: string, payload: UpdateNotePayload) => {
  // prevent empty update
  if (Object.keys(payload).length === 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "At least one field must be provided for update",
    );
  }
  // check if note exists
  const existingNote = await prisma.note.findUnique({
    where: { id: noteId },
    select: { id: true },
  });

  if (!existingNote) {
    throw new AppError(status.NOT_FOUND, "Note not found");
  }

  const updatedNote = await prisma.note.update({
    where: { id: noteId },
    data: { text: payload.text },
  });

  return updatedNote;
};

const deleteNote = async (noteId: string) => {
  const existingNote = await prisma.note.findUnique({
    where: { id: noteId },
    select: { id: true },
  });

  if (!existingNote) {
    throw new AppError(status.NOT_FOUND, "Note not found");
  }

  const deletedNote = await prisma.note.delete({
    where: { id: noteId },
  });

  return deletedNote;
};

const getNotesByParcelId = async (parcelId: string) => {
  const notes = await prisma.note.findMany({
    where: { parcelId },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: true,
    },
  });

  return notes;
};

export const noteServices = {
  addNote,
  updateNote,
  deleteNote,
  getNotesByParcelId,
};
