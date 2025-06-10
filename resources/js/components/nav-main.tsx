import React from "react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { type NavItem } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

  function toggleMenu(title: string) {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  }

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>{!isCollapsed && "Platform"}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = item.children && item.children.length > 0;

          // Cek apakah halaman saat ini adalah bagian dari menu ini
          const childIsActive = hasChildren
            ? item.children!.some((sub) => page.url.startsWith(sub.href || ""))
            : false;

          const isItemActive = page.url.startsWith(item.href || "") || childIsActive;

          // Otomatis buka menu jika salah satu anak aktif
          const isOpen = openMenus[item.title] ?? childIsActive;

          return (
            <React.Fragment key={item.title}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isItemActive}
                  tooltip={{ children: item.title }}
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault();
                      toggleMenu(item.title);
                    }
                  }}
                >
                  {item.href && !hasChildren ? (
                    <Link href={item.href} prefetch className="flex items-center space-x-2">
                      {item.icon && <item.icon />}
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="flex items-center space-x-2 w-full text-left"
                    >
                      {item.icon && <item.icon />}
                      {!isCollapsed && <span>{item.title}</span>}
                      {!isCollapsed && hasChildren && (
                        isOpen ? (
                          <ChevronDown className="w-4 h-4 ml-auto" />
                        ) : (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )
                      )}
                    </button>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Submenu */}
              {hasChildren && isOpen && !isCollapsed && (
                <div className="pl-6 space-y-1">
                  {item.children!.map((subItem) => {
                    const isSubActive = page.url.startsWith(subItem.href || "");
                    return (
                      <SidebarMenuItem key={subItem.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isSubActive}
                          tooltip={{ children: subItem.title }}
                        >
                          <Link href={subItem.href!} className="text-sm flex items-center space-x-2">
                            {subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
