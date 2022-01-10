import { gql } from "@apollo/client";

export const CREATE_POST = gql`
  mutation CreatePost($image: String!, $caption: String) {
    createPost(input: { image: $image, caption: $caption }) {
      id
    }
  }
`;
