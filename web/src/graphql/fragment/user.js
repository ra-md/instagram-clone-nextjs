import { gql } from "@apollo/client";

export const REGULAR_USER = gql`
  fragment RegularUser on User {
    id
    name
    username
    avatar
    followStatus
  }
`;
