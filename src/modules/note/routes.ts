import { Router } from "express";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { noteControllers } from "./controllers";
import { createNoteZodSchema, updateNoteZodSchema } from "./validators";

const router = Router();

// POST: /api/v1/notes - Add note to a parcel (Admin, Super Admin, Merchant, Rider)
router.post(
  "/",
  validateRequest(createNoteZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN", "MERCHANT", "RIDER"),
  noteControllers.addNote,
);

// PATCH: /api/v1/notes/:id - Update note (Admin, Super Admin)
router.patch(
  "/:id",
  validateRequest(updateNoteZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN"),
  noteControllers.updateNote,
);

// DELETE: /api/v1/notes/:id - Delete note (Admin, Super Admin)
router.delete(
  "/:id",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  noteControllers.deleteNote,
);

// GET: /api/v1/notes/:parcelId - Get notes for a parcel (Admin, Super Admin, Merchant, Rider)
router.get(
  "/:parcelId",
  checkAuth("ADMIN", "SUPER_ADMIN", "MERCHANT", "RIDER"),
  noteControllers.getNotesByParcelId,
);

export const noteRoutes = router;
