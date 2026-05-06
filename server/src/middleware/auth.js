import { verifyToken } from "../utils/jwt.js";

export const verifyAdminToken = async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized: No token provided" }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      return c.json({ error: "Unauthorized: Invalid or expired token" }, 401);
    }

    // Attach admin info to context
    c.set("adminId", decoded.adminId);
    c.set("adminEmail", decoded.email);

    await next();
  } catch (err) {
    return c.json({ error: "Unauthorized" }, 401);
  }
};

export const getAdminFromContext = (c) => {
  return {
    adminId: c.get("adminId"),
    email: c.get("adminEmail"),
  };
};
