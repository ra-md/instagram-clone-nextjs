import { gql } from "@apollo/client";

export const UNFOLLOW = gql`
  mutation Unfollow($followingId: String!) {
    unfollow(followingId: $followingId)
  }
`;
