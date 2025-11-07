"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Logo from "@/components/logo";
import {
  LayoutDashboard,
  Bot,
  FileText,
  BarChart,
  Briefcase,
  BookUser,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
  { href: "/chat", icon: <Bot />, label: "AI Chat" },
  { href: "/test", icon: <BarChart />, label: "Career Test" },
  { href: "/resume-upload", icon: <FileText />, label: "Resume Analysis" },
  { href: "/resume-builder", icon: <Briefcase />, label: "Resume Builder" },
  { href: "/report", icon: <BookUser />, label: "Career Report" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
