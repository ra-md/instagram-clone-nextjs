import { gql } from "@apollo/client";

export const POSTS_BY_USERNAME = gql`
  query PostsByUsername($take: Int!, $cursor: String, $username: String!) {
    postsByUsername(take: $take, cursor: $cursor, username: $username) {
      posts {
        author {
          username
        }
        id
        image
      }
      hasMore
    }
  }
`;
