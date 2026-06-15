import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import {
  changePasswordService,
  deleteUserProfileService,
  getCurrentUserService,
  updateUserProfileService,
  deleteUserAccountService,
  getDeletionPreviewService,
} from "../services/user.service";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { UnauthorizedException } from "../utils/appError";
import {
  changePasswordSchema,
  updateUserProfileSchema,
} from "../validation/auth.validation";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res
        .status(HTTPSTATUS.UNAUTHORIZED)
        .json({ message: "User not authenticated" });
    }

    const userId: string = req.user._id.toString();
    const { user } = await getCurrentUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Successfully logged in",
      user,
    });
  }
);

export const updateUserProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id.toString() as string;
    const body = updateUserProfileSchema.parse(req.body);
    const { user } = await updateUserProfileService(userId, body);
    return res.status(HTTPSTATUS.OK).json({
      message: "Profile updated successfully",
      user,
    });
  }
);

export const changePasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id.toString() as string;
    const workspaceId = req.user?.currentWorkspace?.toString() as string;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    if (role === "MEMBER") {
      throw new UnauthorizedException(
        "Members cannot change passwords. Only OWNER or ADMIN."
      );
    }

    const body = changePasswordSchema.parse(req.body);
    const { message } = await changePasswordService(userId, body);
    return res.status(HTTPSTATUS.OK).json({ message });
  }
);

export const deleteUserProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id.toString() as string;
    const { message } = await deleteUserProfileService(userId);
    return res.status(HTTPSTATUS.OK).json({ message });
  }
);

export const getDeletionPreviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id.toString() as string;
    const preview = await getDeletionPreviewService(userId);
    return res.status(HTTPSTATUS.OK).json({ message: "Preview ready", preview });
  }
);

export const deleteUserAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id.toString() as string;
    const { password } = req.body as { password?: string };
    const { message } = await deleteUserAccountService(userId, password);
    return res.status(HTTPSTATUS.OK).json({ message });
  }
);
