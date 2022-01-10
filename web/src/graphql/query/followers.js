import { gql } from "@apollo/client";
import { USERS_PAGINATION } from "../fragment/users-pagination";

export const FOLLOWERS = gql`
  query followers($username: String!, $take: Int!, $cursor: String) {
    followers(username: $username, take: $take, cursor: $cursor) {
      ...UsersPagination
    }
  }
  ${USERS_PAGINATION}
`;
