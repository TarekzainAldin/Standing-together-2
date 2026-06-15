"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const usreRoutes = (0, express_1.Router)();
usreRoutes.get("/current", user_controller_1.getCurrentUserController);
usreRoutes.put("/profile/update", user_controller_1.updateUserProfileController);
usreRoutes.put("/change-password", user_controller_1.changePasswordController);
usreRoutes.delete("/profile/delete", user_controller_1.deleteUserProfileController);
// Account deletion (preview + confirm)
usreRoutes.get("/account/deletion-preview", user_controller_1.getDeletionPreviewController);
usreRoutes.delete("/account", user_controller_1.deleteUserAccountController);
exports.default = usreRoutes;
