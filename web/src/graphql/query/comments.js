import { gql } from "@apollo/client";

export const COMMENTS = gql`
  query Comments($postId: String!, $take: Int!, $cursor: String) {
    comments(postId: $postId, take: $take, cursor: $cursor) {
      comments {
        author {
          username
          avatar
        }
        id
        content
        createdAt
      }
      hasMore
    }
  }
`;
