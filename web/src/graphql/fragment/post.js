import { gql } from "@apollo/client";

export const REGULAR_POST = gql`
  fragment RegularPost on Post {
    author {
      username
      avatar
    }
    id
    caption
    image
    likeCount
    commentCount
    createdAt
    likeStatus
  }
`;
