import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import http from "http";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { HelloResolver } from "./resolvers/hello";
import { UserResolver } from "./resolvers/UserResolver";
import { PostResolver } from "./resolvers/PostResolver";
import { CommentResolver } from "./resolvers/CommentResolver";
import { prisma } from "./prismaClient";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import session, { Session } from "express-session";
import { COOKIE_NAME } from "./constants";
import { createLikeLoader } from "./utils/createLikeLoader";
import { createFollowLoader } from "./utils/createFollowLoader";
import multer from "multer";
import cloudinary from "./cloudinary";
import fs from "fs";

const upload = multer({
  storage: multer.diskStorage({}),
});

async function main() {
  const app = express();
  const httpServer = http.createServer(app);
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET!,
      resave: false,
    })
  );

  app.post(
    "/upload",
    upload.single("file"),
    async (
      req: express.Request & { session: Session & { userId?: string } },
      res
    ) => {
      if (req.session.userId == null) {
        res.status(403).json({
          message: "not authenticated",
        });
      } else if (
        req.file == null ||
        req.file.mimetype.includes("image") == false
      ) {
        res.status(400).json({
          message: "file error",
        });
      } else {
        cloudinary.uploader
          .upload(req.file.path)
          .then(({ public_id }) => {
            if (req.file) {
              fs.unlink(req.file.path, (err) => {
                if (err) throw new Error();

                res.status(200).json({
                  public_id,
                });
              });
            } else {
              throw new Error();
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              message: "server error"
            })
          });
      }
    }
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver, PostResolver, CommentResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      likeLoader: createLikeLoader(),
      followLoader: createFollowLoader(),
    }),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(
    `Server ready at http://localhost:4000${apolloServer.graphqlPath}`
  );
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => await prisma.$disconnect());
