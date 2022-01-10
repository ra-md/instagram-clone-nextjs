import { gql } from "@apollo/client";

export const CREATE_COMMENT = gql`
  mutation CreateComment($content: String!, $postId: String!) {
    createComment(input: { content: $content, postId: $postId }) {
      id
    }
  }
`;
