import DataLoader from "dataloader";
import { prisma } from "../prismaClient";

export function createFollowLoader() {
  return new DataLoader<
    { followingId: string; followerId: string },
    ({ followingId: string, followerId: string, status: boolean }) | null
  >(async (keys) => {
    const follows = await prisma.follow.findMany({
      where: {
        followingId: { in: keys.map((key) => key.followingId) },
        followerId: { in: keys.map((key) => key.followerId) },
      },
    });

    return keys.map((key) => {
      const status = follows.filter(
        (follow) => follow.followingId === key.followingId && follow.followerId === key.followerId
      );
      return {
        status: status.length > 0,
        ...key,
      };
    });
  });
}
