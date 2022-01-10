import { gql } from "@apollo/client";

export const LIKE = gql`
  mutation Like($postId: String!) {
    like(postId: $postId)
  }
`;
