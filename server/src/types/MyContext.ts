import { Request, Response } from "express";
import { Redis } from "ioredis";
import { Session } from "express-session";
import { createLikeLoader } from '../utils/createLikeLoader'
import { createFollowLoader } from '../utils/createFollowLoader'

export type MyContext = {
  req: Request & { session: Session & { userId: string } };
  redis: Redis;
  res: Response;
  likeLoader: ReturnType<typeof createLikeLoader>;
  followLoader: ReturnType<typeof createFollowLoader>;
};
