"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { redirect } from "next/navigation";
import { Product, ProductResponse } from "../../../types/product";
import {
  deleteFromCloudinary,
  getPublicIdFromUrl,
  uploadToCloudinary,
} from "@/data/actions/uploadAction";
import { v2 as cloudinary } from "cloudinary";

// Type definitions

export type ProductData = {
  data: {
    id: string;
    sku: string;
    name: string;
    price: number;
    images: [];
  };
};

// API base URL
const API_URL = process.env.API_URL || "http://localhost:3001";

// Helper function to get the JWT token from cookies
const getToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
};

// Fetch products with pagination and sorting
export async function getProducts(
  page: number = 1,
  limit: number = 10,
  sort: string = "sku",
  order: string = "asc"
): Promise<{ products: Product[]; totalPages: number; total:number }> {
  const token = await getToken();

  if (!token) {
    redirect("/auth/login");
  }

  try {
    const response = await fetch(
      `${API_URL}/products?page=${page}&limit=${limit}&sort=${sort}&order=${order}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("data from actiom", data);
    return {
      total: data.data.total,
      products: data.data.products,
      totalPages: data.data.pages,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], totalPages: 0, total:0 };
  }
}

// Get a single product by ID
export async function getProduct(id: string): Promise<ProductResponse | null> {
  const token = await getToken();

  if (!token) {
    redirect("/auth/login");
  }

  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

// Form validation schema
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  images: z.array(z.string()).optional(),
});

// Create new product
export async function createProduct(formData: FormData) {
  const token = await getToken();
  if (!token) {
    redirect("/auth/login");
  }

  try {
    // Extract image files from formData
    const imageFiles = formData.getAll("images") as File[];

    // Upload images to Cloudinary (directly from server action)
    let imageUrls: { url: string; publicId: string }[] = [];

    if (imageFiles && imageFiles.length > 0) {
      const uploadPromises = imageFiles.map((file) => uploadToCloudinary(file));
      const results = await Promise.all(uploadPromises);

      // Filter out any failed uploads
      imageUrls = results.filter((result) => result !== null) as {
        url: string;
        publicId: string;
      }[];
    }

    // Parse and validate form data
    const product = {
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string),
      // Use just the URLs for the product creation
      images: imageUrls.map((img) => img.url),
      // Optionally store public IDs if you need them for deletion later
    };

    const validatedData = productSchema.parse(product);

    // Send to API (without the images, since they're already uploaded)
    const response = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      // If product creation fails, you might want to clean up the uploaded images
      // This is optional but good practice to avoid orphaned images
      if (imageUrls.length > 0) {
        try {
          await Promise.all(
            imageUrls.map(
              (img) =>
                new Promise((resolve) => {
                  cloudinary.uploader.destroy(img.publicId, (error) => {
                    if (error) console.error("Failed to delete image:", error);
                    resolve(null);
                  });
                })
            )
          );
        } catch (cleanupError) {
          console.error("Failed to clean up images:", cleanupError);
        }
      }

      throw new Error(`Failed to create product: ${response.statusText}`);
    }

    // Revalidate products page to show new data

    redirect("/products");
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return validation errors
      return { success: false, errors: error.errors };
    }
    console.error("Error creating product:", error);
    return {
      success: false,
      error: "Failed to create product",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update existing product
export async function updateProduct(id: string, formData: FormData) {
  const token = await getToken();
  if (!token) {
    redirect("/auth/login");
  }

  try {
    // Get the current product data (including existing images)
    const currentProduct = await fetch(`${API_URL}/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());

    // Parse existing cloudinary images from the current product
    const existingImageUrls = currentProduct.images || [];

    // Extract image data from formData
    const imageFiles = formData.getAll("images") as (File | string)[];
    const keptImageUrls: string[] = [];
    const newImageFiles: File[] = [];

    // Separate kept URLs from new files
    imageFiles.forEach((item) => {
      if (typeof item === "string") {
        // This is a URL of an existing image to keep
        keptImageUrls.push(item);
      } else if (item instanceof File) {
        // This is a new file to upload
        newImageFiles.push(item);
      }
    });

    // Find images to delete (in existingImageUrls but not in keptImageUrls)
    const imagesToDelete = existingImageUrls.filter(
      (url: any) => !keptImageUrls.includes(url)
    );

    // Delete images from Cloudinary
    if (imagesToDelete.length > 0) {
      await Promise.all(
        imagesToDelete.map((url: any) => {
          const publicId = getPublicIdFromUrl(url);
          if (publicId) {
            return deleteFromCloudinary(publicId);
          }
          return Promise.resolve(false);
        })
      );
    }

    console.log("kept image files", keptImageUrls);
    console.log("kept image files", newImageFiles);

    // Upload new images to Cloudinary
    let newImageUrls: string[] = [];

    if (newImageFiles.length > 0) {
      const uploadPromises = newImageFiles.map((file) =>
        uploadToCloudinary(file)
      );
      const uploadResults = await Promise.all(uploadPromises);
      newImageUrls = uploadResults
        .filter((result) => result !== null)
        .map((result) => result!.url);
    }

    // Combine kept URLs with new URLs
    const allImageUrls = [...keptImageUrls, ...newImageUrls];

    console.log("all image urls", allImageUrls);

    // Parse and validate form data
    const product = {
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string),
      images: allImageUrls,
    };

    const validatedData = productSchema.parse(product);

    console.log("validated data", validatedData);

    // Send to API
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.statusText}`);
    }

    // Revalidate products page to show updated data
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return validation errors
      return { success: false, errors: error.errors };
    }
    console.error(`Error updating product ${id}:`, error);
    return { success: false, error: "Failed to update product" };
  }
}

// Delete product
export async function deleteProduct(id: string) {
  const token = await getToken();

  if (!token) {
    redirect("/auth/login");
  }

  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("response", response.ok);

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.statusText}`);
    }

    // Revalidate products page to reflect deletion
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    return { success: false, error: "Failed to delete product" };
  }
}
export async function uploadImages(images: File[]): Promise<string[]> {
  try {
    if (!images || images.length === 0) {
      return [];
    }

    const uploadData = new FormData();
    images.forEach((image) => {
      uploadData.append("images", image);
    });

    const response = await fetch(`http://localhost:3001/uploads/images`, {
      method: "POST",
      body: uploadData,
    });

    const result = await response.json();

    console.log("result", result);

    if (!response.ok) {
      throw new Error(result.message || "Failed to upload images");
    }

    // Assuming your API returns an array of image URLs
    return result.imageUrls || [];
  } catch (err: any) {
    console.error("Image upload error:", err);
    throw err; // Rethrow to be caught by the calling function
  }
}
