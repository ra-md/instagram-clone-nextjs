import { gql } from "@apollo/client";

export const UNLIKE = gql`
  mutation Unlike($postId: String!) {
    unlike(postId: $postId)
  }
`;
