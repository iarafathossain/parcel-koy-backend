import * as zod from "zod";

export const createNoteZodSchema = zod.object({
  parcelId: zod.string().uuid("Invalid Parcel ID"),
  text: zod.string().min(1, "Note text is required"),
});

export const updateNoteZodSchema = zod.object({
  text: zod.string().min(1, "Note text is required"),
});

export type CreateNotePayload = zod.infer<typeof createNoteZodSchema>;
export type UpdateNotePayload = zod.infer<typeof updateNoteZodSchema>;
