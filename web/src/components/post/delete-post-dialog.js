import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { DELETE_POST } from "../../graphql/mutation/delete-post";
import { useMutation } from "@apollo/client";
import { Spinner } from "../ui/spinner";
import { useRouter } from "next/router";

export function DeletePostDialog({
  id,
  closeModal,
  isOpen,
  redirectAfterDelete,
}) {
  const router = useRouter();

  const [deletePost, { loading }] = useMutation(DELETE_POST, {
    variables: { id },
    update: (cache) => {
      cache.evict({ id: cache.identify({ id, __typename: "Post" }) });
      cache.gc();

      if (redirectAfterDelete) {
        router.back();
      }

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
          <Button
            className="w-24 hover:bg-blue-100 bg-white text-blue-500"
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Button
            className="w-24 hover:bg-red-100 bg-white text-red-500"
            onClick={deletePost}
          >
            Yes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
