import { ObjectType, Field } from "type-graphql";
import { User } from "./User";

@ObjectType()
export class Post {
  @Field()
  id: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field()
  author: User;

  @Field()
  authorId: string;

  @Field(() => String, { nullable: true })
  caption: string;

  @Field()
  image: string;

  @Field()
  likeCount: number;

  @Field()
  commentCount: number;
}

