import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/components/queryClient";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "E-commerce Admin Panel",
  description: "Admin panel for managing e-commerce products",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ReactQueryProvider>
          {session && <Header />}
          <main className="container mx-auto px-4 py-6">{children}</main>
          <Toaster richColors />
        </ReactQueryProvider>
      </body>
    </html>
  );
}