import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { DELETE_COMMENT } from "../../graphql/mutation/delete-comment";
import { useMutation } from "@apollo/client";
import { Spinner } from "../ui/spinner";
import { updateCommentCountCache } from "../../utils/update-comment-count-cache";

export function DeleteCommentDialog({ commentId, postId, closeModal, isOpen }) {
  const [deleteComment, { loading }] = useMutation(DELETE_COMMENT, {
    variables: { commentId },
    update: (cache) => {
      cache.evict({
        id: cache.identify({ id: commentId, __typename: "Comment" }),
      });
      cache.gc();
      updateCommentCountCache({ value: -1, postId, cache });
      closeModal();
    },
  });

  return (
    <Modal isOpen={isOpen} closeModal={closeModal}>
      <div className="relative">
        {loading && (
          <div className="bg-white absolute inset-0 bg-opacity-70 grid place-content-center">
            <Spinner color="black" />
          </div>
        )}
        <h1>Are you sure?</h1>
        <div className="flex justify-evenly mt-4">
          <Button className="w-24 bg-white text-black" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            className="w-24 bg-white text-red-500"
            onClick={deleteComment}
          >
            Yes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
