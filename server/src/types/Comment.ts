import { ObjectType, Field } from "type-graphql";
import { User } from "./User";
import { Post } from "./Post";

@ObjectType()
export class Comment {
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
  commentToUserId: string

  @Field()
  postId: string

  @Field()
  post: Post

  @Field()
  content: string
}
