import type { Metadata } from "next";
import "./globals.css";
import {
  ClerkProvider,
} from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";

import { cn } from "@/lib/utils";
import { ModalProvider } from "@/components/providers/modal-provider";

export const metadata: Metadata = {
  title: "Nebula",
  description: "The next gen Real-Time Communication Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("bg-white dark:bg-[#313338]")}>
        <ClerkProvider afterSignOutUrl="/">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="discord-theme"
          >
            <ModalProvider />
            <div className="h-[100vh]">
              {children}
            </div>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
