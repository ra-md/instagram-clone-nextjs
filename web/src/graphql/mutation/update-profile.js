import { gql } from "@apollo/client";

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($avatar: String!, $name: String!, $username: String!) {
    updateProfile(avatar: $avatar, name: $name, username: $username) {
      error {
        message
      }
    }
  }
`;
