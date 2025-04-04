import {ProductForm} from "@/components/ProductForm";
import { getProduct } from "../ProductAction";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Check authentication
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  const { id } = await params;

  const product = await getProduct(id);

  console.log("product",product)

  if (!product) {
    notFound();
  }
  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm initialData={product.data} isEditing={true}  />
    </div>
  );
}
