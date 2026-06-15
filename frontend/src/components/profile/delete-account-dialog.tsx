import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { deleteUserAccountMutationFn, getDeletionPreviewQueryFn } from "@/lib/api";
import { useStoreBase } from "@/store/store";
import type { DeletionPreviewResponseType } from "@/types/api.type";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountDialog = ({
  isOpen,
  onClose,
}: DeleteAccountDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearAccessToken } = useStoreBase.getState();

  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");

  const { data, isLoading: isPreviewLoading } =
    useQuery<DeletionPreviewResponseType>({
      queryKey: ["deletionPreview"],
      queryFn: getDeletionPreviewQueryFn,
      enabled: isOpen,
    });

  const preview = data?.preview;

  const { mutate: deleteAccount, isPending } = useMutation({
    mutationFn: deleteUserAccountMutationFn,
    onSuccess: () => {
      clearAccessToken();
      queryClient.clear();
      navigate("/", { replace: true });
    },
  });

  const handleConfirm = () => {
    if (confirmText !== "DELETE" || isPending) return;
    deleteAccount(password ? { password } : undefined);
  };

  const handleClose = () => {
    if (isPending) return;
    setConfirmText("");
    setPassword("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-red-600 dark:text-red-400">
            {t("profile.delete_account_confirm_title")}
          </DialogTitle>
          <DialogDescription>
            {t("profile.delete_account_warning")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Workspace impact warning */}
          {isPreviewLoading ? (
            <div className="flex justify-center py-4">
              <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : preview?.isOwner ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>
                {t("profile.delete_owner_title", {
                  count: preview.ownedWorkspaces.length,
                })}
              </AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1">
                  {preview.ownedWorkspaces.map((ws) => (
                    <li key={ws.id.toString()}>
                      <span className="font-medium">{ws.name}</span>
                      {" — "}
                      {t("profile.members_count", { count: ws.memberCount })}
                      {", "}
                      {t("profile.tasks_count", { count: ws.taskCount })}
                      {", "}
                      {t("profile.projects_count", { count: ws.projectCount })}
                    </li>
                  ))}
                </ul>
                <p className="mt-3">{t("profile.delete_owner_body")}</p>
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("profile.delete_member_body")}
            </p>
          )}

          {/* Optional password field */}
          <div className="space-y-1.5">
            <Label htmlFor="delete-password">
              {t("profile.delete_password_label")}
            </Label>
            <Input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl"
              disabled={isPending}
            />
          </div>

          {/* "Type DELETE" confirmation input */}
          <div className="space-y-1.5">
            <Label htmlFor="delete-confirm">
              {t("profile.delete_type_confirm")}
            </Label>
            <Input
              id="delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="rounded-xl font-mono"
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            {t("projects.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmText !== "DELETE" || isPending}
          >
            {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {t("profile.delete_button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
