import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { z } from "zod";
import { HTTPSTATUS } from "../config/http.config";
import {
  joinWorkspaceByInviteService,
  removeMemberService,
} from "../services/member.service";

export const joinWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const inviteCode = z.string().parse(req.params.inviteCode);
    const userId = req.user?._id;

    const { workspaceId, role } = await joinWorkspaceByInviteService(
      userId,
      inviteCode
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Successfully joined the workspace",
      workspaceId,
      role,
    });
  }
);

export const removeMemberController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = z.string().parse(req.params.workspaceId);
    const memberId = z.string().parse(req.params.memberId);
    const requestingUserId = req.user?._id;

    const result = await removeMemberService(
      requestingUserId,
      workspaceId,
      memberId
    );

    return res.status(HTTPSTATUS.OK).json(result);
  }
);
