import { Router } from "express";
import {
  joinWorkspaceController,
  removeMemberController,
} from "../controllers/member.controller";

const memberRoutes = Router();

memberRoutes.post("/workspace/:inviteCode/join", joinWorkspaceController);
memberRoutes.delete("/:workspaceId/remove/:memberId", removeMemberController);

export default memberRoutes;