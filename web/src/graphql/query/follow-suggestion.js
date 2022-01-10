import { gql } from "@apollo/client";

export const FOLLOW_SUGGESTION = gql`
  query FollowSuggestion($take: Int!, $cursor: String) {
    followSuggestion(take: $take, cursor: $cursor) {
      users {
        id
        username
        avatar
        followStatus
      }
      hasMore
    }
  }
`;
