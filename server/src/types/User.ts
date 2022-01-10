import { ObjectType, Field } from 'type-graphql'

@ObjectType()
export class User {
  @Field()
  id: string

  @Field()
  email: string

  @Field()
  name: string

  @Field()
  username: string

  @Field()
  avatar: string

  @Field(() => String, { nullable: true })
  bio?: string | null

  @Field()
  followerCount: number

  @Field()
  followingCount: number

  @Field()
  postCount: number
}