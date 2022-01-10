import { gql } from "@apollo/client";

export function updateCommentCountCache({ value, postId, cache }) {
  const data = cache.readFragment({
    id: `Post:${postId}`,
    fragment: gql`
      fragment readPost on Post {
        commentCount
      }
    `,
  });

  if (data) {
    cache.writeFragment({
      id: `Post:${postId}`,
      fragment: gql`
        fragment updateCommentCount on Post {
          commentCount
        }
      `,
      data: { commentCount: data.commentCount + value },
    });
  }
}
