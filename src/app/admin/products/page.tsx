import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/app/products/ProductAction";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil } from "lucide-react";
import DeleteProductButton from "@/components/DeleteProductButton";
import { PaginationButtons } from "@/components/PaginationButton";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page: number; sort?: string; order?: string }>;
}) {
  const { page } = await searchParams || 1 ;
  const { sort } = await  searchParams || "sku";
  const { order } = await searchParams || "asc";



  const {products, totalPages} = await getProducts(page , 10, sort, order);




  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/products/add">Add New Product</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Image</TableHead>
              <TableHead>
                <Link
                  href={`/products?sort=sku&order=${
                    sort === "sku" && order === "asc" ? "desc" : "asc"
                  }`}
                  className="flex items-center hover:underline"
                >
                  SKU
                </Link>
              </TableHead>
              <TableHead>
                <Link
                  href={`/products?sort=name&order=${
                    sort === "name" && order === "asc" ? "desc" : "asc"
                  }`}
                  className="flex items-center hover:underline"
                >
                  Name
                </Link>
              </TableHead>
              <TableHead>
                <Link
                  href={`/products?sort=price&order=${
                    sort === "price" && order === "asc" ? "desc" : "asc"
                  }`}
                  className="flex items-center hover:underline"
                >
                  Price
                </Link>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.images && product.images.length > 0 ? (
                    <div className="relative h-12 w-12 rounded overflow-hidden">
                      <Image
                        src={product.images[0] || "plsceholder"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.sku}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>&#x20b9;{product.price}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/products/${product.id}`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <DeleteProductButton productId={product.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationButtons currentPage={page} totalPages={totalPages} />
    </div>
  );
}
