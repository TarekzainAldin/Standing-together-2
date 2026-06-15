"use client";

import {
  LucideIcon,
  Settings,
  Users,
  CheckCircle,
  LayoutDashboard,
  UserCircle,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type ItemType = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export function NavMain() {
  const { t } = useTranslation();
  const workspaceId = useWorkspaceId();
  const location = useLocation();
  const pathname = location.pathname;

  const items: ItemType[] = [
    {
      title: t("nav.dashboard"),
      url: `/workspace/${workspaceId}`,
      icon: LayoutDashboard,
    },
    {
      title: t("nav.tasks"),
      url: `/workspace/${workspaceId}/tasks`,
      icon: CheckCircle,
    },
    {
      title: t("nav.members"),
      url: `/workspace/${workspaceId}/members`,
      icon: Users,
    },
    {
      title: t("nav.settings"),
      url: `/workspace/${workspaceId}/settings`,
      icon: Settings,
    },
    {
      title: t("nav.profile"),
      url: `/workspace/${workspaceId}/profile`,
      icon: UserCircle,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = item.url === pathname;
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200",
                    "hover:bg-gradient-to-r hover:from-indigo-100 hover:to-indigo-200 hover:text-indigo-700 dark:hover:from-indigo-900 dark:hover:to-indigo-800",
                    isActive &&
                      "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-white" : "text-indigo-500"
                    )}
                  />
                  <span className="font-medium text-sm">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
