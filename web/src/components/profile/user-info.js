import { useRouter } from "next/router";
import { USER } from "../../graphql/query/user";
import { ME } from "../../graphql/query/me";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import NextImage from "next/image";
import NextLink from "next/link";
import { Button } from "../ui/button";
import { imageURL } from "../../utils/image-url";
import { FOLLOW } from "../../graphql/mutation/follow";
import { FOLLOWERS } from "../../graphql/query/followers";
import { FOLLOWING } from "../../graphql/query/following";
import { UNFOLLOW } from "../../graphql/mutation/unfollow";
import { Spinner } from "../ui/spinner";
import { useState, useEffect } from "react";
import { UserList } from "../user-list";
import { UpdateProfile } from "./update-profile";
import { useApollo } from "../../lib/apollo-client";

export function UserInfo() {
  const router = useRouter();
  const client = useApollo({});

  const { data: userData, loading: userLoading } = useQuery(USER, {
    variables: {
      username: router.query.username,
    },
    fetchPolicy: "cache-and-network",
  });

  const meQuery = useQuery(ME);

  const [follow, { loading: followLoading }] = useMutation(FOLLOW, {
    variables: {
      followingId: userData?.user.id,
    },
    update: (cache) => {
      cache.evict({ id: `User:${meQuery.data.me.id}` });
      cache.evict({ id: `User:${userData.user.id}` });
    },
  });

  const [unfollow, { loading: unfollowLoading }] = useMutation(UNFOLLOW, {
    variables: {
      followingId: userData?.user.id,
    },
    update: (cache) => {
      cache.evict({ id: `User:${meQuery.data.me.id}` });
      cache.evict({ id: `User:${userData.user.id}` });
    },
  });

  const [openUpdate, setOpenUpdate] = useState(false);

  const followButton =
    userData?.user.followStatus === true ? (
      <Button
        size="sm"
        className="w-36 bg-red-500 text-white"
        onClick={unfollow}
        isLoading={unfollowLoading}
      >
        Unfollow
      </Button>
    ) : (
      <Button
        size="sm"
        className="w-36 text-white bg-blue-500"
        onClick={follow}
        isLoading={followLoading}
      >
        Follow
      </Button>
    );

  return userData ? (
    <>
      <div className="flex gap-16">
        <NextImage
          width="150"
          height="150"
          className="rounded-full justify-self-center"
          src={imageURL(userData.user.avatar)}
        />
        <div>
          <div className="flex items-center gap-4 mb-4">
            <p className="text-2xl">{userData.user.username}</p>
            {meQuery.loading || userData.loading ? null : meQuery.data &&
              userData.user.username === meQuery.data.me.username ? (
              <Button
                className="bg-white text-black border-2 border-gray-900"
                size="sm"
                onClick={() => setOpenUpdate(true)}
              >
                Edit Profile
              </Button>
            ) : (
              followButton
            )}
          </div>
          <div className="flex gap-4">
            <p>
              <span className="font-bold mr-2">{userData.user.postCount}</span>
              posts
            </p>
            <button
              onClick={() => {
                client.cache.evict({
                  fieldName: `followers:{"username":"${router.query.username}"}`,
                });
                router.push(`/${userData.user.username}/followers`);
              }}
            >
              <span className="mr-2 font-bold">
                {userData.user.followerCount}
              </span>{" "}
              <span>followers</span>
            </button>
            <button
              onClick={() => {
                client.cache.evict({
                  fieldName: `following:{"username":"${router.query.username}"}`,
                });
                router.push(`/${userData.user.username}/following`);
              }}
            >
              <span className="mr-2 font-bold">
                {userData.user.followingCount}
              </span>{" "}
              <span>following</span>
            </button>
          </div>
          <p>{userData.user.bio}</p>
        </div>
      </div>
      <UpdateProfile
        isOpen={openUpdate}
        closeModal={() => setOpenUpdate(false)}
      />
    </>
  ) : (
    <h1 className="text-center">User not found!</h1>
  );
}
