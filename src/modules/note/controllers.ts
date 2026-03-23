import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { noteServices } from "./services";

const addNote = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! User not found in request",
    );
  }

  const result = await noteServices.addNote(req.body, user.userId);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Note added successfully",
    data: result,
  });
});

const updateNote = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(status.BAD_REQUEST, "Note ID is required");
  }

  if (typeof id !== "string") {
    throw new AppError(status.BAD_REQUEST, "Note ID must be a string");
  }

  const result = await noteServices.updateNote(id, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Note updated successfully",
    data: result,
  });
});

const deleteNote = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(status.BAD_REQUEST, "Note ID is required");
  }

  if (typeof id !== "string") {
    throw new AppError(status.BAD_REQUEST, "Note ID must be a string");
  }

  const result = await noteServices.deleteNote(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Note deleted successfully",
    data: result,
  });
});

const getNotesByParcelId = catchAsync(async (req: Request, res: Response) => {
  const { parcelId } = req.params;
  if (!parcelId) {
    throw new AppError(status.BAD_REQUEST, "Parcel ID is required");
  }

  if (typeof parcelId !== "string") {
    throw new AppError(status.BAD_REQUEST, "Parcel ID must be a string");
  }

  const result = await noteServices.getNotesByParcelId(parcelId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Notes retrieved successfully",
    data: result,
  });
});

export const noteControllers = {
  addNote,
  updateNote,
  deleteNote,
  getNotesByParcelId,
};
