import { useQuery } from "@apollo/client";
import { COMMENTS } from "../../graphql/query/comments";
import { ME } from "../../graphql/query/me";
import { Spinner } from "../ui/spinner";
import NextLink from "next/link";
import NextImage from "next/image";
import { format } from "../../utils/format-date";
import { Button } from "../ui/button";
import { imageURL } from "../../utils/image-url";
import { DeleteCommentDialog } from "./delete-dialog";
import { useState, useEffect } from "react";
import { UpdateComment } from "./update-comment";
import { useRouter } from "next/router";

export function CommentSection({ postId, hideLoadMore = false }) {
  const { data, loading, fetchMore, variables } = useQuery(COMMENTS, {
    variables: {
      take: 10,
      postId,
    },
  });
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (mounted && !data && !loading) {
    router.replace(`/p/${postId}`);
  }

  return (
    <div>
      {loading ? (
        <div className="flex justify-center">
          <Spinner color="black" />
        </div>
      ) : (
        <div className="grid gap-4">
          {data &&
            data.comments.comments.map((comment) => {
              return (
                <CommentItem
                  key={comment.id}
                  username={comment.author.username}
                  avatar={comment.author.avatar}
                  content={comment.content}
                  createdAt={comment.createdAt}
                  id={comment.id}
                  postId={postId}
                />
              );
            })}
          {data && data.comments.hasMore && !hideLoadMore && (
            <Button
              className="mx-auto w-36 text-blue-500 bg-white hover:bg-blue-100"
              isLoading={loading}
              onClick={() => {
                fetchMore({
                  variables: {
                    take: variables.take,
                    cursor:
                      data.comments.comments[data.comments.comments.length - 1]
                        .id,
                    postId,
                  },
                });
              }}
            >
              load more
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function CommentItem({ username, content, createdAt, avatar, id, postId }) {
  const { data } = useQuery(ME);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);

  return (
    <>
      <div className="text-left">
        <div className="flex flex-wrap gap-4 items-center">
          <NextImage
            className="rounded-full"
            width="30"
            height="30"
            src={imageURL(avatar)}
          />
          <NextLink href={`/${username}`}>
            <a>{username}</a>
          </NextLink>
          <p className="text-sm">{content}</p>
        </div>
        <div className="flex gap-2 mt-4 items-center">
          <p className="text-gray-500 text-sm">{format(createdAt)}</p>
          {data && data.me.username === username && (
            <>
              <Button
                onClick={() => setIsOpen(true)}
                size="sm"
                className="bg-white text-red-500"
              >
                delete
              </Button>
              <Button
                onClick={() => setIsOpenUpdate(true)}
                size="sm"
                className="bg-white text-blue-500"
              >
                update
              </Button>
            </>
          )}
        </div>
      </div>
      <DeleteCommentDialog
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        commentId={id}
        postId={postId}
      />
      <UpdateComment
        content={content}
        isOpen={isOpenUpdate}
        closeModal={() => setIsOpenUpdate(false)}
        commentId={id}
        postId={postId}
      />
    </>
  );
}
