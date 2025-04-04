
import {ProductForm} from "@/components/ProductForm";
import { auth, getToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AddProductPage() {
  // Check authentication
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="my-6">
      <h1 className="text-2xl font-bold mb-3">Add New Product</h1>
      <p className="text-red-700">NOTE:SKU is auto-generated</p>
      </div>
      <ProductForm />
    </div>
  );
}
