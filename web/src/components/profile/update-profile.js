import { ME } from "../../graphql/query/me";
import { UPDATE_PROFILE } from "../../graphql/mutation/update-profile";
import { useQuery, useMutation } from "@apollo/client";
import { Modal } from "../ui/modal";
import { TextField } from "../ui/text-field";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { imageURL } from "../../utils/image-url";
import { uploadImage } from "../../utils/upload-image";
import { useRouter } from "next/router";

export function UpdateProfile({ isOpen, closeModal }) {
  const { data, loading } = useQuery(ME);
  const [updateName, setUpdateName] = useState("");
  const [updateUsername, setUpdateUsername] = useState("");
  const [file, setFile] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState("");
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const router = useRouter();

  useEffect(() => {
    if (data) {
      setUpdateName(data.me.name);
      setUpdateUsername(data.me.username);
    }
  }, [data]);

  async function update() {
    setLoadingUpdate(true);
    let public_id = null;

    if (file) {
      const response = await uploadImage(file);
      public_id = response.public_id;
    }

    const updateResponse = await updateProfile({
      variables: {
        name: updateName,
        username: updateUsername,
        avatar: public_id || data.me.avatar,
      },
    });

    if (updateResponse.data.updateProfile.error) {
      setError("invalid");
    } else {
      router.replace(`/${updateUsername}`);
      closeModal();
    }

    setLoadingUpdate(false);
  }

  function close() {
    if (loadingUpdate) return;
    closeModal();
  }

  return (
    <Modal isOpen={isOpen} closeModal={close} p="0">
      <div className="relative">
        {loadingUpdate && (
          <div className="absolute z-10 grid place-content-center inset-0 bg-white bg-opacity-75">
            <Spinner color="black" />
          </div>
        )}
        <p className="p-2 border-b border-gray-300">Update profile</p>
        {loading ? (
          <div color="black" className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="px-4 grid gap-4">
            <div className="flex mt-4 justify-center items-center flex-col">
              <img
                className="rounded-full h-[50px] w-[50px]"
                src={
                  file ? URL.createObjectURL(file) : imageURL(data.me.avatar)
                }
              />
              <label
                className="cursor-pointer hover:text-blue-500 mt-2"
                htmlFor="file"
              >
                Update avatar
                <input
                  id="file"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(event) => {
                    setFile(event.target.files[0]);
                  }}
                />
              </label>
            </div>
            <div className="text-left">
              <label htmlFor="name">
                Name
                <TextField
                  value={updateName}
                  onChange={(e) => setUpdateName(e.target.value)}
                  id="name"
                />
              </label>
            </div>
            <div className="text-left">
              <label htmlFor="username">
                Username
                <TextField
                  value={updateUsername}
                  onChange={(e) => setUpdateUsername(e.target.value)}
                  id="username"
                />
              </label>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="mb-4 flex justify-between">
              <Button className="hover:text-red-500" onClick={closeModal}>
                Close
              </Button>
              <Button
                onClick={update}
                className="text-blue-500 hover:bg-blue-100 disabled:hover:bg-white disabled:text-gray-300"
                disabled={!updateUsername || !updateName}
              >
                Update
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
