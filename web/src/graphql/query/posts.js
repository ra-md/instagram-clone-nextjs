import { gql } from "@apollo/client";
import { REGULAR_POST } from "../fragment/post";

export const POSTS = gql`
  query Posts($take: Int!, $cursor: String) {
    posts(take: $take, cursor: $cursor) {
      posts {
        ...RegularPost
      }
      hasMore
    }
  }
  ${REGULAR_POST}
`;
