import DataLoader from "dataloader";
import { prisma } from "../prismaClient";

export function createLikeLoader() {
  return new DataLoader<
    { postId: string; userId: string },
    ({ postId: string, userId: string, status: boolean }) | null
  >(async (keys) => {
    const likes = await prisma.like.findMany({
      where: {
        postId: { in: keys.map((key) => key.postId) },
        userId: { in: keys.map((key) => key.userId) },
      },
    });

    return keys.map((key) => {
      const status = likes.filter(
        (like) => like.postId === key.postId && like.userId === key.userId
      );
      return {
        status: status.length > 0,
        ...key,
      };
    });
  });
}
