import { SidebarTrigger } from "@/components/ui/sidebar";
import UserNav from "./user-nav";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:justify-end md:px-6">
      <SidebarTrigger className="md:hidden" />
      <UserNav />
    </header>
  );
}
