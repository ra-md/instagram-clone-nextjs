import { Button } from "./ui/button";
import { imageURL } from "../utils/image-url";
import NextImage from "next/image";
import NextLink from "next/link";
import { useEffect } from "react";
import { useLazyQuery, useQuery, useMutation, gql } from "@apollo/client";
import { LIKE_LIST } from "../graphql/query/like-list";
import { ME } from "../graphql/query/me";
import { FOLLOW } from "../graphql/mutation/follow";
import { UNFOLLOW } from "../graphql/mutation/unfollow";

export function UserItem({ avatar, username, followStatus, userId }) {
  const { data } = useQuery(ME);

  const [follow, { loading: followLoading }] = useMutation(FOLLOW, {
    variables: {
      followingId: userId,
    },
    update: (cache) => {
      updateCache({
        value: true,
        followingId: userId,
        cache,
      });
    },
  });
  const [unfollow, { loading: unfollowLoading }] = useMutation(UNFOLLOW, {
    variables: {
      followingId: userId,
    },
    update: (cache) => {
      updateCache({
        value: false,
        followingId: userId,
        cache,
      });
    },
  });

  return (
    <div className="flex gap-4 items-center">
      <NextImage
        className="rounded-full"
        src={imageURL(avatar)}
        width={26}
        height={26}
      />
      <NextLink href={`/${username}`}>{username}</NextLink>
      {data &&
        data.me.username !== username &&
        (followStatus === true ? (
          <Button
            size="sm"
            onClick={unfollow}
            isLoading={unfollowLoading}
            className="ml-auto w-20 text-white bg-red-500"
          >
            Unfollow
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={follow}
            isLoading={followLoading}
            className="ml-auto w-20 text-white bg-blue-500"
          >
            Follow
          </Button>
        ))}
    </div>
  );
}

function updateCache({ cache, followingId, value }) {
  cache.writeFragment({
    id: `User:${followingId}`,
    fragment: gql`
      fragment _ on User {
        followStatus
      }
    `,
    data: {
      followStatus: value,
    },
  });
}
