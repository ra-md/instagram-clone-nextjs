import { CREATE_COMMENT } from "../../graphql/mutation/create-comment";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import { Button } from "../ui/button";
import { updateCommentCountCache } from "../../utils/update-comment-count-cache";

export function CommentForm({ postId }) {
  const [content, setContent] = useState("");

  const [createComment, { loading }] = useMutation(CREATE_COMMENT, {
    variables: {
      content,
      postId,
    },
    update: (cache) => {
      cache.evict({ fieldName: `comments:{"postId":"${postId}"}` });
      updateCommentCountCache({ value: 1, postId, cache });
    },
  });

  async function submitComment(event) {
    event.preventDefault();

    if (content) {
      await createComment();
      setContent("");
    }
  }

  return (
    <form onSubmit={submitComment} className="flex">
      <input
        className="border border-gray-300 w-full px-1 rounded-md"
        type="text"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={loading}
      />
      <Button
        className="w-32 ml-4 disabled:bg-blue-200 bg-blue-500 text-white"
        disabled={!content}
        type="submit"
        isLoading={loading}
      >
        Comment
      </Button>
    </form>
  );
}
