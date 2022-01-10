import NextLink from "next/link";
import NextImage from "next/image";
import { imageURL } from "../../../utils/image-url";
import { Menu } from "@headlessui/react";
import {
  DotsVerticalIcon,
  TrashIcon,
  LinkIcon,
} from "@heroicons/react/outline";
import { useState } from "react";
import { DeletePostDialog } from "../delete-post-dialog";

export function Header({ avatar, username, id, redirectAfterDelete = false }) {
  const [isOpen, setIsOpen] = useState(false);

  function copyUrl() {
    navigator.clipboard.writeText(`${window.location.host}/${id}`);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img
            className="rounded-full w-[30px] h-[30px]"
            src={imageURL(avatar)}
          />
          <NextLink href={`/${username}`}>
            <a className="ml-4 font-semibold text-black">{username}</a>
          </NextLink>
        </div>
        <div className="w-56 text-right z-10 flex justify-end items-center">
          <Menu as="div" className="menu">
            <div>
              <Menu.Button className="block">
                <DotsVerticalIcon
                  className="w-5 h-5 text-black hover:text-blue-500"
                  aria-hidden="true"
                />
              </Menu.Button>
            </div>
            <Menu.Items className="menu-items">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "text-blue-500" : "text-gray-900"
                    } group flex rounded-t-md items-center w-full p-2 text-sm`}
                    onClick={copyUrl}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                    Copy Url
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "text-red-500" : "text-gray-900"
                    } group flex rounded-b-md items-center w-full p-2 text-sm`}
                    onClick={() => setIsOpen(true)}
                  >
                    <TrashIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                    Delete
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </div>
      <DeletePostDialog
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        id={id}
        redirectAfterDelete={redirectAfterDelete}
      />
    </>
  );
}
