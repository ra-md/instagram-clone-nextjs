import { Modal } from "../ui/modal";
import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { CREATE_POST } from "../../graphql/mutation/create-post";
import { ME } from "../../graphql/query/me";
import { useMutation, gql, useQuery } from "@apollo/client";
import { Spinner } from "../ui/spinner";
import { useRouter } from "next/router";
import { useApollo } from "../../lib/apollo-client";
import { uploadImage } from "../../utils/upload-image";

export function CreatePost({ isOpen, closeModal }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const captionRef = useRef(null);
  const [createPost] = useMutation(CREATE_POST);
  const router = useRouter();
  const username = router.query.username;
  const apollo = useApollo({});
  const { data } = useQuery(ME);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
    }
  }, [isOpen]);

  function close() {
    if (isLoading) return;
    closeModal();
  }

  async function share() {
    setIsLoading(true);
    const { public_id } = await uploadImage(file);

    const { errors } = await createPost({
      variables: {
        image: public_id,
        caption: captionRef.current.value,
      },
      update: (cache) => {
        cache.evict({ fieldName: "posts:{}" });

        if (username) {
          cache.evict({
            fieldName: `postsByUsername:{"username":"${username}"}`,
          });
        }

        if (data) {
          updateCache(cache, data.me.id);
        }
      },
    });

    setIsLoading(false);

    if (errors == null) {
      close();
    }
  }

  return (
    <Modal isOpen={isOpen} closeModal={close}>
      {isLoading && (
        <div className="absolute bg-white bg-opacity-75 inset-0 grid place-content-center">
          <Spinner color="black" />
        </div>
      )}
      <div className=" mb-4 flex justify-between items-center">
        <Button
          className="hover:text-red-500 text-black bg-white"
          onClick={close}
        >
          Cancel
        </Button>
        <Button
          className={`${
            file
              ? "text-blue-500 hover:bg-blue-100"
              : "text-gray-300 cursor-not-allowed"
          } bg-white`}
          onClick={share}
        >
          Share
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {file ? (
          <img src={URL.createObjectURL(file)} />
        ) : (
          <div className="grid place-content-center h-72">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-28 w-28 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={0.7}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <label className="cursor-pointer bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-opacity-75">
              <input
                className="hidden"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setFile(event.target.files[0]);
                }}
              />
              Select From Computer
            </label>
          </div>
        )}
        <textarea
          ref={captionRef}
          className="h-24 max-h-72 border border-gray-200 p-3 rounded-md"
          placeholder="caption..."
        ></textarea>
      </div>
    </Modal>
  );
}

function updateCache(cache, userId) {
  const data = cache.readFragment({
    id: `User:${userId}`,
    fragment: gql`
      fragment readUser on User {
        postCount
      }
    `,
  });

  if (data) {
    cache.writeFragment({
      id: `User:${userId}`,
      fragment: gql`
        fragment updatePostCount on User {
          postCount
        }
      `,
      data: { postCount: data.postCount + 1 },
    });
  }
}
