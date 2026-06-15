import { ChevronDown, Loader, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { useAuthContext } from "@/context/auth-provider";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeWorkspaceMemberRoleMutationFn, removeMemberMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Permissions } from "@/constant";
import { useTranslation } from "react-i18next";

const AllMembers = () => {
  const { t } = useTranslation();
  const { user, hasPermission } = useAuthContext();
  const canChangeMemberRole = hasPermission(Permissions.CHANGE_MEMBER_ROLE);
  const canRemoveMember = hasPermission(Permissions.REMOVE_MEMBER);

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { data, isPending } = useGetWorkspaceMembers(workspaceId);
  const members = data?.members || [];
  const roles = data?.roles || [];

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: changeWorkspaceMemberRoleMutationFn,
  });

  const { mutate: removeMember, isPending: isRemoving } = useMutation({
    mutationFn: removeMemberMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
      toast({
        title: t("success"),
        description: t("memberRemoved", { defaultValue: "Member removed" }),
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: t("error"),
        description:
          error instanceof Error ? error.message : t("unknownError"),
        variant: "destructive",
      });
    },
  });

  const handleRemove = (memberId: string) => {
    if (!confirm(t("confirmRemoveMember", { defaultValue: "Remove this member?" })))
      return;
    removeMember({ workspaceId, memberId });
  };

  const handleSelect = (roleId: string, memberId: string) => {
    if (!roleId || !memberId) return;
    const payload = {
      workspaceId,
      data: {
        roleId,
        memberId,
      },
    };
    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
        toast({
          title: t("success"),
          description: t("memberRoleChanged"),
          variant: "success",
        });
      },
      onError: (error: unknown) => {
        if (error instanceof Error) {
          toast({
            title: t("error"),
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: t("error"),
            description: t("unknownError"),
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <div className="grid gap-6 pt-2">
      {isPending && (
        <Loader className="w-8 h-8 animate-spin place-self-center flex" />
      )}

      {members.map((member) => {
        const name = member.userId?.name;
        const initials = getAvatarFallbackText(name);
        const avatarColor = getAvatarColor(name);

        return (
          <div
            key={member.userId._id}
            className="flex items-center justify-between space-x-4"
          >
            <div className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={member.userId?.profilePicture || ""}
                  alt="Image"
                />
                <AvatarFallback className={avatarColor}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{name}</p>
                <p className="text-sm text-muted-foreground">
                  {member.userId.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {canRemoveMember &&
                member.userId._id !== user?._id &&
                member.role.name !== "OWNER" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={isRemoving}
                    onClick={() => handleRemove(member.userId._id)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto min-w-24 capitalize disabled:opacity-95 disabled:pointer-events-none"
                    disabled={
                      isLoading ||
                      !canChangeMemberRole ||
                      member.userId._id === user?._id
                    }
                  >
                    {member.role.name?.toLowerCase()}{" "}
                    {canChangeMemberRole && member.userId._id !== user?._id && (
                      <ChevronDown className="text-muted-foreground" />
                    )}
                  </Button>
                </PopoverTrigger>

                {canChangeMemberRole && (
                  <PopoverContent className="p-0" align="end">
                    <Command>
                      <CommandInput
                        placeholder={t("selectNewRole")}
                        disabled={isLoading}
                        className="disabled:pointer-events-none"
                      />
                      <CommandList>
                        {isLoading ? (
                          <Loader className="w-8 h-8 animate-spin place-self-center flex my-4" />
                        ) : (
                          <>
                            <CommandEmpty>{t("noRolesFound")}</CommandEmpty>
                            <CommandGroup>
                              {roles.map(
                                (role) =>
                                  role.name !== "OWNER" && (
                                    <CommandItem
                                      key={role._id}
                                      disabled={isLoading}
                                      className="disabled:pointer-events-none gap-1 mb-1 flex flex-col items-start px-4 py-2 cursor-pointer"
                                      onSelect={() =>
                                        handleSelect(role._id, member.userId._id)
                                      }
                                    >
                                      <p className="capitalize">
                                        {role.name?.toLowerCase()}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {role.name === "ADMIN" &&
                                          t("adminRoleDescription")}
                                        {role.name === "MEMBER" &&
                                          t("memberRoleDescription")}
                                      </p>
                                    </CommandItem>
                                  )
                              )}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                )}
              </Popover>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllMembers;
