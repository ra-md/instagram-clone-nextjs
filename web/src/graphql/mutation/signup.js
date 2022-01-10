import { gql } from "@apollo/client";
import { authResponse } from "../fragment/auth-response";

export const SIGNUP = gql`
  mutation Signup(
    $username: String!
    $name: String!
    $email: String!
    $password: String!
  ) {
    register(
      options: {
        username: $username
        name: $name
        email: $email
        password: $password
      }
    ) {
      errors {
        field
        message
      }
      user {
        id
        name
        username
      }
    }
  }
`;
