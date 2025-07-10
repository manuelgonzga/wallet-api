import { clerkClient } from "@clerk/clerk-sdk-node";
import { sql } from "../config/db.js";

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User ID not found in auth." });
    }

    // Borrar usuario de Clerk
    await clerkClient.users.deleteUser(userId);

    // Borrar datos en base de datos
    await sql`DELETE FROM transactions WHERE user_id = ${userId}`;
    await sql`DELETE FROM user_settings WHERE user_id = ${userId}`;

    console.log(`User ${userId} deleted.`);

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
