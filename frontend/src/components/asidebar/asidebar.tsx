import { useState } from "react";
import { Link } from "react-router-dom";
import { EllipsisIcon, Loader, LogOut, FileSpreadsheet, LayersIcon } from "lucide-react";
import {
  Sidebar, SidebarHeader, SidebarContent, SidebarGroupContent, SidebarGroup,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarRail, useSidebar
} from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/components/logo";
import LogoutDialog from "./logout-dialog";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { Separator } from "../ui/separator";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import { useReport } from "@/hooks/useReport";
import { useTranslation } from "@/hooks/useTranslation";

const Asidebar = () => {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const { isLoading, user } = useAuthContext();
  const { open } = useSidebar(); // ✅ Fixed: no useState here
  const workspaceId = useWorkspaceId();
  const { handleDownloadReport, loading } = useReport();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-800"
      >
        {/* HEADER */}
        <SidebarHeader className="!py-0 border-b border-gray-200 dark:border-gray-800">
          <div className="flex h-[56px] items-center justify-between w-full px-3">
            <div className="flex items-center gap-3">
              <Logo url={`/workspace/${workspaceId}`} />
              {open && (
                <Link
                  to={`/workspace/${workspaceId}`}
                    className="hidden md:flex ml-1.4rem font-semibold text-base bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent"
                >
                  STANDING TOGETHER
                </Link>
              )}
            </div>

            {/* Language Switcher with Flags */}
            <select
              onChange={(e) => changeLanguage(e.target.value)}
              value={currentLanguage}
              className="text-sm px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white appearance-none bg-right-3 bg-no-repeat"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5' viewBox='0 0 8 5'%3E%3Cpolygon fill='%23000' points='0,0 8,0 4,5'/%3E%3C/svg%3E")`,
backgroundRepeat: "no-repeat",
backgroundPosition: "right 0.5rem center",
backgroundSize: "0.5rem auto"

              }}
            >
              
              <option value="en">🇪🇳 English</option>
              <option value="fr">🇫🇷 Français</option> 
              <option value="ar">🇦🇷 العربية</option>
            </select>
          </div>
        </SidebarHeader>

        {/* CONTENT */}
        <SidebarContent className="!mt-0">
          <SidebarGroup className="!py-0">
            <SidebarGroupContent>
              <WorkspaceSwitcher />
              <Separator className="my-3" />
              <NavMain />

              {/* Download Report */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-100 dark:text-indigo-300 dark:hover:bg-gray-800 transition-all rounded-lg"
                    disabled={loading}
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    {loading ? t("sidebar.generating") : t("sidebar.download_report")}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <DropdownMenuItem
                    onClick={() => handleDownloadReport(workspaceId)}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    {t("sidebar.current_workspace")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDownloadReport()}
                    className="flex items-center gap-2"
                  >
                    <LayersIcon className="w-4 h-4" />
                    {t("sidebar.all_workspaces")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator className="my-3" />
              <NavProjects />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* FOOTER */}
        <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              {isLoading ? (
                <Loader className="place-self-center animate-spin text-indigo-500" size="24px" />
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="flex items-center gap-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-gray-800 transition-all"
                    >
                      <Avatar className="h-9 w-9 rounded-full shadow">
                        <AvatarImage src={user?.profilePicture || ""} />
                        <AvatarFallback className="rounded-full border border-gray-400 dark:border-gray-600 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                          {user?.name?.split(" ")?.[0]?.charAt(0)}
                          {user?.name?.split(" ")?.[1]?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold text-gray-800 dark:text-gray-200">
                          {user?.name}
                        </span>
                        <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </span>
                      </div>
                      <EllipsisIcon className="ml-auto text-gray-500 dark:text-gray-400" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                    side="bottom"
                    align="start"
                    sideOffset={4}
                  >
                    <DropdownMenuItem
                      onClick={() => setIsLogoutOpen(true)}
                      className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("sidebar.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        {/* Privacy policy link */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800">
          <Link
            to="/legal/privacy"
            className="text-xs text-muted-foreground hover:underline"
          >
            {t("legal.privacy_policy")}
          </Link>
        </div>

        <SidebarRail />
      </Sidebar>

      {/* Logout Dialog */}
      <LogoutDialog isOpen={isLogoutOpen} setIsOpen={setIsLogoutOpen} />
    </>
  );
};

export default Asidebar;
