import { gql } from "@apollo/client";

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($content: String!, $commentId: String!) {
    updateComment(content: $content, id: $commentId) {
      id
    }
  }
`;
