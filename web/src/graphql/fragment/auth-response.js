import { gql } from "@apollo/client";
import { REGULAR_ERROR } from "./error";
import { REGULAR_USER } from "./user";

export const AUTH_RESPONSE = gql`
  fragment AuthResponse on UserResponse {
    errors {
      ...RegularError
    }
    user {
      ...RegularUser
    }
  }
  ${REGULAR_ERROR}
  ${REGULAR_USER}
`;
