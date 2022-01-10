import { gql } from "@apollo/client";
import { USERS_PAGINATION } from "../fragment/users-pagination";

export const LIKE_LIST = gql`
  query LikeList($postId: String!, $take: Int!, $cursor: String) {
    likeList(postId: $postId, take: $take, cursor: $cursor) {
      ...UsersPagination
    }
  }
  ${USERS_PAGINATION}
`;
