import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <h2 className="text-2xl font-bold mb-2">Not Found</h2>
      <p className="text-muted-foreground mb-6">
        The resource you're looking for doesn't exist.
      </p>
      <Button asChild>
        <Link href="/products">Back to Products</Link>
      </Button>
    </div>
  );
}
