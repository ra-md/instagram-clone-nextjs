import { gql } from "@apollo/client";

export const REGULAR_ERROR = gql`
  fragment RegularError on FieldError {
    field
    message
  }
`;
