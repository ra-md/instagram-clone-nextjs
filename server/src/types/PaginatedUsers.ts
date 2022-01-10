import { ObjectType, Field } from "type-graphql";
import {User} from './User'

@ObjectType()
class PaginatedUser {
  @Field()
  id: string

  @Field()
  user: User
}

@ObjectType()
export class PaginatedUsers {
  @Field(() => [PaginatedUser])
  users: PaginatedUser[];

  @Field()
  hasMore: boolean;
}