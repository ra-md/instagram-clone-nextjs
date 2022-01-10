import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { TextField } from "../ui/text-field";
import { UPDATE_COMMENT } from "../../graphql/mutation/update-comment";
import { useMutation, gql } from "@apollo/client";
import { Spinner } from "../ui/spinner";
import { useState } from "react";

export function UpdateComment({
  content,
  commentId,
  postId,
  closeModal,
  isOpen,
}) {
  const [newContent, setNewContent] = useState(content);
  const [updateComment, { loading }] = useMutation(UPDATE_COMMENT, {
    variables: {
      content: newContent,
      commentId,
    },
    update: (cache) => {
      updateCache({ newContent, commentId, cache });
      closeModal();
    },
  });

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} p="0">
      <div className="relative">
        {loading && (
          <div className="bg-white absolute inset-0 bg-opacity-70 grid place-content-center">
            <Spinner color="black" />
          </div>
        )}
        <p className="border-b border-gray-300 py-2">Update Comment</p>
        <div className="m-4">
          <TextField
            value={newContent}
            onChange={(event) => setNewContent(event.target.value)}
          />
        </div>
        <div className="flex justify-evenly mt-4 py-2">
          <Button className="w-24 bg-white text-black" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            className="w-24 bg-white text-blue-500"
            onClick={updateComment}
          >
            Update
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function updateCache({ newContent, commentId, cache }) {
  cache.writeFragment({
    id: `Comment:${commentId}`,
    fragment: gql`
      fragment __ on Comment {
        content
      }
    `,
    data: { content: newContent },
  });
}
