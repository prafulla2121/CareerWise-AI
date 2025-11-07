import Logo from "@/components/logo";
import { FirebaseClientProvider } from "@/firebase";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <FirebaseClientProvider>
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-md">
                    <div className="mb-8 flex justify-center">
                        <Logo />
                    </div>
                    {children}
                </div>
            </div>
        </FirebaseClientProvider>
    );
}
