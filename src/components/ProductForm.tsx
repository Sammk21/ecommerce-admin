"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { productSchema, ProductFormValues } from "@/lib/validators";
import { createProduct, updateProduct } from "@/app/products/ProductAction";

interface ProductFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export const ProductForm = ({
  initialData,
  isEditing = false,
}: ProductFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    initialData?.images ? initialData.images : []
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "",
      price: 0,
      sku: "",
      isActive: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing) {
        const response = await updateProduct(initialData.id, data);
        return response;
      } else {
        const response = await createProduct(data);
        return response;
      }
    },
    onSuccess: () => {
      toast(`Product ${isEditing ? "updated" : "created"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      router.push("/admin/products");
    },
    onError: (error) => {
      console.error(error);
      toast.error(`Failed to ${isEditing ? "update" : "create"} product`);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setNewImageFiles((prev) => [...prev, ...files]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImageUrls((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const onSubmit = async (values: ProductFormValues) => {
    const formData = new FormData();

    // Append form values
    formData.append("name", values.name);
    formData.append("price", values.price.toString());
   

    // Append existing image URLs that were kept
    existingImageUrls.forEach((url) => {
      formData.append("images", url);
    });

    // Append new image files
    newImageFiles.forEach((image) => {
      formData.append("images", image);
    });

    mutation.mutate(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Product price"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <div className="space-y-2">
          <FormLabel>Product Images</FormLabel>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex items-center justify-center w-24 h-24 bg-gray-100 border-2 border-dashed rounded-md hover:bg-gray-50 transition">
                <Plus className="h-6 w-6 text-gray-500" />
              </div>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                multiple
                onChange={handleImageChange}
              />
            </label>

            {/* Existing image previews */}
            {existingImageUrls.map((url, index) => (
              <div key={`existing-${index}`} className="relative w-24 h-24">
                <img
                  src={url}
                  alt={`Existing image ${index}`}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* New image previews */}
            {newImageFiles.map((file, index) => (
              <div key={`new-${index}`} className="relative w-24 h-24">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`New image ${index}`}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditing ? "Update" : "Create"} Product
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};
