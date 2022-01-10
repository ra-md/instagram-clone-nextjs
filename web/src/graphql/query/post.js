import { gql } from "@apollo/client";
import { REGULAR_POST } from "../fragment/post";

export const POST = gql`
  query Post($id: String!) {
    post(id: $id) {
      ...RegularPost
    }
  }
  ${REGULAR_POST}
`;
