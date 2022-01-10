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
  } from "type-graphql";
  import { Comment } from "../types/Comment";
  import { isAuth } from "../middleware/isAuth";
  import { prisma } from "../prismaClient";
  import { MyContext } from "../types/MyContext";
  
  @InputType()
  class CommentInput {
    @Field(() => String, { nullable: true })
    commentToUserId: string;
    @Field()
    content: string;
    @Field()
    postId: string;
  }
  
  @ObjectType()
  class PaginatedComments {
    @Field(() => [Comment])
    comments: Comment[];
    @Field()
    hasMore: boolean;
  }
  
  @Resolver(Comment)
  export class CommentResolver {
    @Mutation(() => Comment)
    @UseMiddleware(isAuth)
    async createComment(
      @Arg("input") input: CommentInput,
      @Ctx() { req }: MyContext
    ) {
      try {
        const [comment] = await prisma.$transaction([
          prisma.comment.create({
            data: {
              ...input,
              authorId: req.session.userId,
            },
            include: { author: true },
          }),
          prisma.$executeRaw`
              UPDATE "Post"
              SET "commentCount" = "commentCount" + 1
              WHERE "id" = ${input.postId};
            `,
        ]);
  
        return comment;
      } catch (error) {
        console.log(error)
        return false
      }
    }
  
    @Query(() => PaginatedComments)
    @UseMiddleware(isAuth)
    async comments(
      @Arg("take", () => Int) take: number,
      @Arg("postId", () => String) postId: string,
      @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    ) {
      const max = 50;
      const realLimit = Math.min(max, take || max);
      const realLimitPlusOne = realLimit + 1;
      const myCursor = cursor ? { id: cursor } : undefined;
  
      try {
        const comments = await prisma.comment.findMany({
          where: {
            commentToUserId: null,
            postId
          },
          include: { author: true },
          take: realLimitPlusOne,
          skip: cursor ? 1 : undefined,
          orderBy: { createdAt: "desc" },
          cursor: myCursor,
        })
  
        return {
          comments: comments.slice(0, realLimit),
          hasMore: comments.length === realLimitPlusOne,
        };
      } catch (error) {
        console.log(error)
        return error
      }
  
    }
  
    // update comment
    @Mutation(() => Comment)
    @UseMiddleware(isAuth)
    async updateComment(
      @Arg('content') content: string,
      @Arg('id') id: string,
      @Ctx() {req}: MyContext
    ) {
      try {
        const comment = await prisma.comment.findUnique({
          where: {id}
        })
  
        if(comment?.authorId === req.session.userId) {
          return prisma.comment.update({
            where: {id},
            data: {
              content,
            },
            include: {author: true}
          })
        }
  
        throw new Error()
      } catch(error) {
        console.log(error)
        return false
      }
    }
  
    // delete comment
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deleteComment(
      @Arg('commentId') commentId: string,
      @Ctx() {req}: MyContext
    ) {
      try {
        const comment = await prisma.comment.findUnique({
          where: {
            id: commentId
          }
        })
  
        await prisma.$transaction([
          prisma.comment.deleteMany({
            where: {
              authorId: req.session.userId,
              id: commentId
            }
          }),
          prisma.$executeRaw`
              UPDATE "Post"
              SET "commentCount" = "commentCount" - 1
              WHERE "id" = ${comment?.postId};
            `,
        ]);
  
        return true
      } catch (error) {
        console.log(error)
        return false
      }
    }
  }
  