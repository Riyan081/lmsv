import prisma from "@repo/db/client";
import type { UserProfile } from "@repo/common/schemas";

export const userService = {
  /**
   * Get all users (public profile fields only).
   */
  async getAllUsers(): Promise<UserProfile[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    return users as UserProfile[];
  },

  /**
   * Get the authenticated user's profile from the request.
   */
  getUserProfile(user: any) {
    return user;
  },
};
