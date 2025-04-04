import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type UserSession = {
  id: string;
  email: string;
  role: string;
};

export const getToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
};

export async function auth(): Promise<UserSession | null> {
  const token = await getToken();

  if (!token) {
    return null;
  }

 try {
   const decoded = jwt.verify(
     token,
     process.env.JWT_SECRET || "default_secret"
   ) as unknown as UserSession;

   if (decoded && decoded.id && decoded.email && decoded.role) {
     return decoded;
   } else {
     console.error("Decoded token is missing required properties");
     return null;
   }
 } catch (error) {
   console.error("Auth error:", error);
   return null;
 }
}

export async function hasRole(requiredRole: string): Promise<boolean> {
  const session = await auth();
  return !!session && session.role === requiredRole;
}
