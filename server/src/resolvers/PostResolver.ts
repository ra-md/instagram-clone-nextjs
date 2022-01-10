import { prisma } from "../prismaClient";
import {
  Mutation,
  UseMiddleware,
  Query,
  Field,
  Resolver,
  Arg,
  Ctx,
  InputType,
  Int,
  ObjectType,
  FieldResolver,
  Root,
} from "type-graphql";
import { MyContext } from "../types/MyContext";
import { Post } from "../types/Post";
import { PaginatedUsers } from "../types/PaginatedUsers";
import { isAuth } from "../middleware/isAuth";
import cloudinary from "../cloudinary";

@InputType()
class PostInput {
  @Field(() => String, { nullable: true })
  caption: string;
  @Field()
  image: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(@Arg("input") input: PostInput, @Ctx() { req }: MyContext) {
    try {
      const [post] = await prisma.$transaction([
        prisma.post.create({
          data: {
            ...input,
            authorId: req.session.userId,
          },
          include: { author: true },
        }),
        prisma.$executeRaw`
          UPDATE "User"
          SET "postCount" = "postCount" + 1
          WHERE id = ${req.session.userId};
        `,
      ]);

      return post;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  @Query(() => PaginatedPosts)
  @UseMiddleware(isAuth)
  async postsByUsername(
    @Arg("take", () => Int) take: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Arg("username", () => String) username: string
  ) {
    const max = 50;
    const realLimit = Math.min(max, take || max);
    const realLimitPlusOne = realLimit + 1;
    const myCursor = cursor ? { id: cursor } : undefined;

    const posts = await prisma.post.findMany({
      where: {
        author: {
          username,
        },
      },
      include: { author: true },
      take: realLimitPlusOne,
      skip: cursor ? 1 : undefined,
      orderBy: { createdAt: "desc" },
      cursor: myCursor,
    });

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => PaginatedPosts)
  @UseMiddleware(isAuth)
  async posts(
    @Arg("take", () => Int) take: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ) {
    const max = 50;
    const realLimit = Math.min(max, take || max);
    const realLimitPlusOne = realLimit + 1;
    const myCursor = cursor ? { id: cursor } : undefined;

    const following = await prisma.follow.findMany({
      where: {
        followerId: req.session.userId,
      },
    });

    const followingIds =
      following != null ? following.map((item) => item.followingId) : [];

    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: [req.session.userId, ...followingIds] },
      },
      include: { author: true },
      take: realLimitPlusOne,
      skip: cursor ? 1 : undefined,
      orderBy: { createdAt: "desc" },
      cursor: myCursor,
    });

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  @Query(() => Post)
  @UseMiddleware(isAuth)
  post(@Arg("id") id: string) {
    return prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(@Arg("id") id: string, @Ctx() { req }: MyContext) {
    try {
      const post = await prisma.post.findUnique({
        where: {
          id,
        },
      });

      if (post) {
        await cloudinary.uploader.destroy(post.image);
      }

      await prisma.$transaction([
        prisma.post.deleteMany({
          where: {
            authorId: req.session.userId,
            id,
          },
        }),
        prisma.$executeRaw`
            UPDATE "User"
            SET "postCount" = "postCount" - 1
            WHERE "id" = ${post?.authorId};
          `,
      ]);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async like(@Arg("postId") postId: string, @Ctx() { req }: MyContext) {
    try {
      const checkLike = await prisma.like.findMany({
        where: {
          userId: req.session.userId,
          postId,
        },
      });

      if (checkLike.length > 0) {
        throw new Error();
      }

      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId: req.session.userId,
            postId,
          },
        }),
        prisma.$executeRaw`
          UPDATE "Post"
          SET "likeCount" = "likeCount" + 1
          WHERE "id" = ${postId};
        `,
      ]);

      return true;
    } catch (error) {
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async unlike(@Arg("postId") postId: string, @Ctx() { req }: MyContext) {
    try {
      const checkLike = await prisma.like.findMany({
        where: {
          userId: req.session.userId,
          postId,
        },
      });

      if (checkLike.length === 0) {
        throw new Error();
      }

      await prisma.$transaction([
        prisma.like.deleteMany({
          where: {
            userId: req.session.userId,
            postId,
          },
        }),
        prisma.$executeRaw`
          UPDATE "Post"
          SET "likeCount" = "likeCount" - 1
          WHERE "id" = ${postId};
        `,
      ]);

      return true;
    } catch (error) {
      return false;
    }
  }

  @FieldResolver(() => Boolean)
  async likeStatus(@Root() post: Post, @Ctx() { req, likeLoader }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    const loader = await likeLoader.load({
      userId: req.session.userId,
      postId: post.id,
    });

    return loader ? loader.status : null;
  }

  @Query(() => PaginatedUsers)
  @UseMiddleware(isAuth)
  async likeList(
    @Arg("postId") postId: string,
    @Arg("take", () => Int) take: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ) {
    const max = 50;
    const realLimit = Math.min(max, take || max);
    const realLimitPlusOne = realLimit + 1;
    const myCursor = cursor ? { id: cursor } : undefined;

    const likes = await prisma.like.findMany({
      where: {
        postId,
      },
      include: { user: true },
      take: realLimitPlusOne,
      skip: cursor ? 1 : undefined,
      orderBy: { createdAt: "desc" },
      cursor: myCursor,
    });

    return {
      users: likes.slice(0, realLimit),
      hasMore: likes.length === realLimitPlusOne,
    };
  }
}
