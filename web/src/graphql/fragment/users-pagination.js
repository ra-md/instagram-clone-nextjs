import { gql } from "@apollo/client";
import { REGULAR_USER } from "./user";

export const USERS_PAGINATION = gql`
  fragment UsersPagination on PaginatedUsers {
    users {
      id
      user {
        ...RegularUser
      }
    }
    hasMore
  }
  ${REGULAR_USER}
`;
