// types/product.ts
export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  images?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
success: boolean
data:Product
message:string
}


export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}
