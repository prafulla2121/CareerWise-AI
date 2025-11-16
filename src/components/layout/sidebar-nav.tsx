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
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if(isUserLoading) {
    return (
        <>
            <SidebarHeader>
                <Logo />
            </SidebarHeader>
            <SidebarContent className="p-2">
                {/* You can add a skeleton loader here */}
            </SidebarContent>
        </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
