import { prisma } from "../prismaClient";
import {
  Mutation,
  ObjectType,
  Field,
  Resolver,
  Arg,
  Ctx,
  UseMiddleware,
  Query,
  FieldResolver,
  Root,
  Int,
} from "type-graphql";
import { UsernamePasswordInput } from "../types/UsernamePasswordInput";
import { MyContext } from "../types/MyContext";
import { validateRegister } from "../utils/validateRegister";
import argon2 from "argon2";
import { User } from "../types/User";
import { COOKIE_NAME } from "../constants";
import { isAuth } from "../middleware/isAuth";
import { PaginatedUsers } from "../types/PaginatedUsers";
import cloudinary from "../cloudinary";

@ObjectType()
class FieldError {
  @Field(() => String, {nullable: true})
  field?: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
class PaginatedFollowSuggestion {
  @Field(() => [User])
  users: User[];

  @Field()
  hasMore: boolean;
}

@ObjectType()
class UpdateResponse {
  @Field(() => FieldError, { nullable: true })
  error?: FieldError

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => Boolean)
  async followStatus(
    @Root() user: User,
    @Ctx() { req, followLoader }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const loader = await followLoader.load({
      followingId: user.id,
      followerId: req.session.userId,
    });

    return loader ? loader.status : null;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ) {
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    let user;

    try {
      user = await prisma.user.create({
        data: {
          email: options.email,
          username: options.username,
          password: hashedPassword,
          name: options.name,
        },
      });
    } catch (error) {
      console.log(error);
      if (error.message.includes("email")) {
        return {
          errors: [
            {
              field: "email",
              message: "email already taken",
            },
          ],
        };
      }

      if (error.message.includes("username")) {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
    }

    if (user) {
      req.session.userId = user.id;
    }

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("emailOrUsername") emailOrUsername: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ) {
    const isEmail = emailOrUsername.includes("@");

    const user = await prisma.user.findUnique({
      where: isEmail
        ? { email: emailOrUsername }
        : { username: emailOrUsername },
    });

    if (!user) {
      return {
        errors: [
          {
            field: "emailOrUsername",
            message: `${isEmail ? "email" : "username"} doesn't exist`,
          },
        ],
      };
    }

    const verify = await argon2.verify(user.password, password);

    if (!verify) {
      return {
        errors: [
          {
            field: "password",
            message: `incorrect password`,
          },
        ],
      };
    }

    if (user) {
      req.session.userId = user.id;
    }

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }

  @Query(() => User)
  @UseMiddleware(isAuth)
  me(@Ctx() { req }: MyContext) {
    return prisma.user.findUnique({
      where: {
        id: req.session.userId,
      },
    });
  }

  @Query(() => User)
  @UseMiddleware(isAuth)
  user(@Arg("username") username: string) {
    return prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async follow(
    @Arg("followingId") followingId: string,
    @Ctx() { req }: MyContext
  ) {
    try {
      const follow = await prisma.follow.findMany({
        where: {
          followerId: req.session.userId,
          followingId,
        },
      });

      if (follow.length > 0 || followingId === req.session.userId) {
        throw new Error();
      }

      await prisma.$transaction([
        prisma.follow.create({
          data: {
            followerId: req.session.userId,
            followingId,
          },
        }),
        prisma.$executeRaw`
					UPDATE "User"
					SET "followingCount" = "followingCount" + 1
					WHERE id = ${req.session.userId};
				`,
        prisma.$executeRaw`
					UPDATE "User"
					SET "followerCount" = "followerCount" + 1
					WHERE id = ${followingId};
				`,
      ]);

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async unfollow(
    @Arg("followingId") followingId: string,
    @Ctx() { req }: MyContext
  ) {
    try {
      const follow = await prisma.follow.findMany({
        where: {
          followerId: req.session.userId,
          followingId,
        },
      });

      if (follow.length < 1) throw new Error();

      await prisma.$transaction([
        prisma.follow.deleteMany({
          where: {
            followerId: req.session.userId,
            followingId,
          },
        }),
        prisma.$executeRaw`
					UPDATE "User"
					SET "followingCount" = "followingCount" - 1
					WHERE id = ${req.session.userId};
				`,
        prisma.$executeRaw`
					UPDATE "User"
					SET "followerCount" = "followerCount" - 1
					WHERE id = ${followingId};
				`,
      ]);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  @Query(() => PaginatedUsers)
  @UseMiddleware(isAuth)
  async followers(
    @Arg("username") username: string,
    @Arg("take", () => Int) take: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ) {
    const max = 50;
    const realLimit = Math.min(max, take || max);
    const realLimitPlusOne = realLimit + 1;
    const myCursor = cursor ? { id: cursor } : undefined;

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    const followers = await prisma.follow.findMany({
      where: {
        followingId: user?.id,
      },
      include: { follower: true },
      take: realLimitPlusOne,
      skip: cursor ? 1 : undefined,
      orderBy: { createdAt: "desc" },
      cursor: myCursor,
    });

    return {
      users: followers
        .slice(0, realLimit)
        .map(({ id, follower }) => ({ id, user: follower })),
      hasMore: followers.length === realLimitPlusOne,
    };
  }

  @Query(() => PaginatedUsers)
  @UseMiddleware(isAuth)
  async following(
    @Arg("username") username: string,
    @Arg("take", () => Int) take: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ) {
    const max = 50;
    const realLimit = Math.min(max, take || max);
    const realLimitPlusOne = realLimit + 1;
    const myCursor = cursor ? { id: cursor } : undefined;

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    const following = await prisma.follow.findMany({
      where: {
        followerId: user?.id,
      },
      include: { following: true },
      take: realLimitPlusOne,
      skip: cursor ? 1 : undefined,
      orderBy: { createdAt: "desc" },
      cursor: myCursor,
    });

    return {
      users: following
        .slice(0, realLimit)
        .map(({ id, following }) => ({ id, user: following })),
      hasMore: following.length === realLimitPlusOne,
    };
  }

  @Query(() => PaginatedFollowSuggestion)
  @UseMiddleware(isAuth)
  async followSuggestion(
    @Arg("take", () => Int) take: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ) {
    const max = 50;
    const realLimit = Math.min(max, take || max);
    const realLimitPlusOne = realLimit + 1;
    const myCursor = cursor ? { id: cursor } : undefined;

    const user = await prisma.follow.findMany({
      where: {
        followerId: req.session.userId,
      },
    });

    const follow = await prisma.user.findMany({
      where: {
        id: {
          notIn: [
            ...user.map(({ followingId }) => followingId),
            req.session.userId,
          ],
        },
      },
      take: realLimitPlusOne,
      skip: cursor ? 1 : undefined,
      cursor: myCursor,
    });

    return {
      users: follow.slice(0, realLimit),
      hasMore: follow.length === realLimitPlusOne,
    };
  }

  @Mutation(() => UpdateResponse)
  @UseMiddleware(isAuth)
  async updateProfile(
    @Arg("avatar") avatar: string,
    @Arg("username") username: string,
    @Arg("name") name: string,
    @Ctx() { req }: MyContext
  ) {
    if (!avatar || !username || !name || /^[a-zA-Z0-9_]+$/.test(username) === false) {
      return {
        error: {
          message: "invalid"
        }
      }
    }

    const profile = await prisma.user.findUnique({
      where: {
        id: req.session.userId
      }
    })

    if(profile && profile.avatar !== avatar && profile.avatar !== 'default.jpg') {
      await cloudinary.uploader.destroy(profile.avatar);
    }

    const user = await prisma.user.update({
      where: {
        id: req.session.userId,
      },
      data: {
        avatar,
        username,
        name,
      },
    });

    return { user }
  }
}
