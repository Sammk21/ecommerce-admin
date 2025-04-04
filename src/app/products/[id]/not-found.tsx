import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
      <p className="text-muted-foreground mb-6">
        The product you're looking for doesn't exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/products">Back to Products</Link>
      </Button>
    </div>
  );
}
