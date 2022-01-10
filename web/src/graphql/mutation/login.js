import { gql } from "@apollo/client";
import { AUTH_RESPONSE } from "../fragment/auth-response";

export const LOGIN = gql`
  mutation Login($emailOrUsername: String!, $password: String!) {
    login(emailOrUsername: $emailOrUsername, password: $password) {
      ...AuthResponse
    }
  }
  ${AUTH_RESPONSE}
`;
