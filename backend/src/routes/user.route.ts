import { Router } from "express";
import {
  changePasswordController,
  deleteUserProfileController,
  getCurrentUserController,
  updateUserProfileController,
  getDeletionPreviewController,
  deleteUserAccountController,
} from "../controllers/user.controller";

const usreRoutes = Router();

usreRoutes.get("/current", getCurrentUserController);
usreRoutes.put("/profile/update", updateUserProfileController);
usreRoutes.put("/change-password", changePasswordController);
usreRoutes.delete("/profile/delete", deleteUserProfileController);

// Account deletion (preview + confirm)
usreRoutes.get("/account/deletion-preview", getDeletionPreviewController);
usreRoutes.delete("/account", deleteUserAccountController);

export default usreRoutes;
