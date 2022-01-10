import { gql } from "@apollo/client";
import { USERS_PAGINATION } from "../fragment/users-pagination";

export const FOLLOWING = gql`
  query following($username: String!, $take: Int!, $cursor: String) {
    following(username: $username, take: $take, cursor: $cursor) {
      ...UsersPagination
    }
  }
  ${USERS_PAGINATION}
`;
