import { format } from "../../../utils/format-date";
import NextLink from "next/link";
import { Like } from "./like";
import { ChatIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { useApollo } from "../../../lib/apollo-client";

export function Detail({
  likeCount,
  username,
  caption,
  commentCount,
  createdAt,
  id,
  likeStatus,
}) {
  const router = useRouter();
  const client = useApollo({});

  return (
    <>
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <Like id={id} likeStatus={likeStatus} />
          {commentCount != null && (
            <button>
              <ChatIcon className="h-8 w-8 text-black" />
            </button>
          )}
        </div>
        <button
          className="font-semibold mr-auto"
          onClick={() => {
            client.cache.evict({ fieldName: `likeList:{"postId":"${id}"}` });
            router.push(`/p/${id}/like`);
          }}
        >
          {likeCount} Likes
        </button>
        {username && caption && (
          <p>
            <NextLink href={`/${username}`}>
              <a className="mr-1 font-semibold text-black">{username}</a>
            </NextLink>
            {caption}
          </p>
        )}
        {commentCount != null && id && (
          <div>
            <div className="hidden md:block">
              <NextLink href={`/p/${id}`}>
                <a className="text-gray-500">
                  View all {commentCount} comments
                </a>
              </NextLink>
            </div>
            <div className="block md:hidden">
              <NextLink href={`/p/${id}/comment`}>
                <a className="text-gray-500">
                  View all {commentCount} comments
                </a>
              </NextLink>
            </div>
          </div>
        )}
        <span className="text-gray-500">{format(createdAt)}</span>
      </div>
    </>
  );
}
