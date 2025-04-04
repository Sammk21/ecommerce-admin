"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Package } from "lucide-react";
import { handleLogout } from "@/data/actions/authAction";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();



  // Only show if not on login page
  if (pathname.startsWith("/auth/")) {
    return null;
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-5 w-5" />
            <span>E-commerce Admin</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/admin/products"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith("/products")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              Products
            </Link>
            {/* Add additional nav items here */}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
