"use server"
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const handleLogout = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("token");
};


const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export async function createAuthHeader() {
const cookieStore = await cookies();
const token =  cookieStore.get("token");

  if (!token) {
    return { error: "No token found" };
  }

  return { Authorization: `Bearer ${token.value}` };
}

export async function generateAndStoreMockToken() {
  const mockUser = {
    id: "01234567-89ab-cdef-0123-456789abcdef",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
  };

  const token = jwt.sign(mockUser, SECRET_KEY, { expiresIn: "30d" });
  const cookieStore = await cookies();
  // Store JWT in HTTP-only cookie

   cookieStore.set({
     name: "token",
     value: token,
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     path: "/",
   });
 

  return { success: "Mock token generated and stored", token };
}

