import NextLink from "next/link";
import NextImage from "next/image";
import { Container } from "./container";
import { LOGOUT } from "../../graphql/mutation/logout";
import { ME } from "../../graphql/query/me";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { HomeIcon, LogoutIcon, PlusIcon } from "@heroicons/react/outline";
import { Spinner } from "./spinner";
import { imageURL } from "../../utils/image-url";
import { CreatePost } from "../post/create-post";
import { useState, useEffect } from "react";
import { useApollo } from "../../lib/apollo-client";
import { Menu } from "@headlessui/react";
import { UserCircleIcon } from "@heroicons/react/outline";

export function Header() {
  const [logout] = useMutation(LOGOUT);
  const { data, loading } = useQuery(ME);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const client = useApollo({});

  async function handleLogout() {
    const { data } = await logout();

    if (data.logout) {
      client.cache.reset();
      router.push("/login");
    }
  }

  return (
    <>
      <header className="bg-white border-b border-gray-300 py-2">
        <Container>
          <div className="flex justify-between items-center">
            <h1>Instagram</h1>
            <ul className="flex items-center gap-4">
              <li>
                <NextLink href="/">
                  <a>
                    <HomeIcon className="h-8 w-8 text-black" />
                  </a>
                </NextLink>
              </li>
              <li className="flex">
                <button onClick={() => setIsOpen(true)}>
                  <PlusIcon className="h-8 w-8 text-black" />
                </button>
              </li>
              <li>
                {loading ? (
                  <Spinner color="text-black" />
                ) : (
                  data && (
                    <div className="text-right relative z-20 flex justify-end items-center">
                      <Menu as="div" className="menu">
                        <div>
                          <Menu.Button className="flex">
                            <NextImage
                              className="rounded-full"
                              width="25"
                              height="25"
                              src={imageURL(data.me.avatar)}
                              alt="menu"
                            />
                          </Menu.Button>
                        </div>
                        <Menu.Items className="menu-items">
                          <Menu.Item>
                            {({ active }) => (
                              <NextLink href={`/${data.me.username}`}>
                                <a
                                  className={`${
                                    active ? "text-blue-500" : "text-gray-900"
                                  } group flex rounded-t-md items-center w-full p-2 text-sm`}
                                >
                                  <UserCircleIcon
                                    className="w-4 h-4 mr-2"
                                    aria-hidden="true"
                                  />
                                  Profile
                                </a>
                              </NextLink>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={`${
                                  active ? "text-red-500" : "text-gray-900"
                                } group flex rounded-b-md items-center w-full p-2 text-sm`}
                                onClick={handleLogout}
                              >
                                <LogoutIcon
                                  className="w-4 h-4 mr-2"
                                  aria-hidden="true"
                                />
                                Logout
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Menu>
                    </div>
                  )
                )}
              </li>
            </ul>
          </div>
        </Container>
      </header>
      <CreatePost isOpen={isOpen} closeModal={() => setIsOpen(!isOpen)} />
    </>
  );
}
