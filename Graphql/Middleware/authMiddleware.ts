import jwt from "jsonwebtoken";
import { Request } from "express";

export interface AuthUser {
  uid: string;
}

export interface GraphQLContext {
  req: Request;
  res: any;
  auth: AuthUser | null;
}

export const authenticate = (req: Request): AuthUser | null => {
  try {
    const token = req.cookies?.token;
     if (!token) {
        throw new Error("Not authenticated");
      }

    const secret = process.env.JWT_SECRET || "devsecret";
    return jwt.verify(token, secret) as AuthUser;
  } catch {
    return null;
  }
};


export const requireAuth = (ctx: GraphQLContext): string => {
  if (!ctx.auth || !ctx.auth.uid) {
    throw new Error("Not authenticated");
  }
  return ctx.auth.uid;
};
