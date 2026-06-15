import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  changePasswordMutationFn,
  updateUserProfileMutationFn,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

// ── Schemas ───────────────────────────────────────────────────────────────

const editNameSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().trim().min(1, "Current password is required"),
    newPassword: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EditNameValues = z.infer<typeof editNameSchema>;
type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

// ── EditNameForm ──────────────────────────────────────────────────────────

const EditNameForm = ({ name }: { name: string }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<EditNameValues>({
    resolver: zodResolver(editNameSchema),
    defaultValues: { name },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateUserProfileMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast({ title: t("profile.name_updated") });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: EditNameValues) => {
    if (isPending) return;
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.edit_name")}</FormLabel>
              <FormControl>
                <Input className="rounded-xl" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isPending}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl"
        >
          {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          {t("profile.save_changes")}
        </Button>
      </form>
    </Form>
  );
};

// ── ChangePasswordForm ────────────────────────────────────────────────────

const ChangePasswordForm = () => {
  const { t } = useTranslation();

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: changePasswordMutationFn,
    onSuccess: () => {
      form.reset();
      toast({ title: t("profile.password_changed") });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ChangePasswordValues) => {
    if (isPending) return;
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.current_password")}</FormLabel>
              <FormControl>
                <Input type="password" className="rounded-xl" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.new_password")}</FormLabel>
              <FormControl>
                <Input type="password" className="rounded-xl" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("profile.confirm_password")}</FormLabel>
              <FormControl>
                <Input type="password" className="rounded-xl" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isPending}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl"
        >
          {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          {t("profile.save_changes")}
        </Button>
      </form>
    </Form>
  );
};

// ── Profile page ──────────────────────────────────────────────────────────

const Profile = () => {
  const { t } = useTranslation();
  const { user, hasPermission } = useAuthContext();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canChangePassword = hasPermission(Permissions.MANAGE_WORKSPACE_SETTINGS);

  return (
    <div className="w-full h-auto py-2">
      <WorkspaceHeader />
      <Separator className="my-4" />
      <main>
        <div className="w-full max-w-2xl mx-auto py-3 space-y-6">
          {/* User info card */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="text-indigo-700 dark:text-purple-400">
                {t("profile.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="h-16 w-16 shadow">
                <AvatarImage src={user?.profilePicture ?? ""} />
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl">
                  {user?.name?.split(" ")?.[0]?.charAt(0)}
                  {user?.name?.split(" ")?.[1]?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {user?.name}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Edit name — available to ALL users */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="text-base">{t("profile.edit_name")}</CardTitle>
            </CardHeader>
            <CardContent>
              <EditNameForm name={user?.name ?? ""} />
            </CardContent>
          </Card>

          {/* Change password — ONLY OWNER or ADMIN */}
          {canChangePassword && (
            <Card className="rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle className="text-base">
                  {t("profile.change_password")}
                </CardTitle>
                <CardDescription>
                  {t("profile.change_password_description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          )}

          {/* Delete account — available to ALL users */}
          <Card className="rounded-2xl shadow-md border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-base text-red-600 dark:text-red-400">
                {t("profile.delete_account")}
              </CardTitle>
              <CardDescription>
                {t("profile.delete_account_description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="rounded-xl"
                onClick={() => setDeleteOpen(true)}
              >
                {t("profile.delete_account")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <DeleteAccountDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
};

export default Profile;
