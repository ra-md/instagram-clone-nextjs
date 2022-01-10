import { useQuery } from "@apollo/client";
import { POSTS_BY_USERNAME } from "../../graphql/query/user-posts";
import { useRouter } from "next/router";
import { PostItem } from "../post/post-item";
import { Button } from "../ui/button";
import NextImage from "next/image";
import NextLink from "next/link";
import { imageURL } from "../../utils/image-url";

export function Posts() {
  const router = useRouter();

  const { data, fetchMore, variables, loading } = useQuery(POSTS_BY_USERNAME, {
    variables: {
      username: router.query.username,
      take: 10,
    },
  });

  return (
    <div className="mt-8">
      <div className="grid grid-cols-3 gap-4">
        {data && data.postsByUsername.posts.length === 0 ? (
          <h1 className="col-span-3 text-center">No posts</h1>
        ) : (
          data &&
          data.postsByUsername.posts.map((post) => {
            return (
              <div key={post.id}>
                <NextLink href={`/p/${post.id}`}>
                  <a>
                    <NextImage
                      objectFit="cover"
                      width={350}
                      height={350}
                      src={imageURL(post.image)}
                    />
                  </a>
                </NextLink>
              </div>
            );
          })
        )}
      </div>
      {data && data.postsByUsername.hasMore && (
        <Button
          className="mt-8 mx-auto w-36 text-blue-500 bg-white hover:bg-blue-100"
          isLoading={loading}
          onClick={() => {
            fetchMore({
              variables: {
                take: variables.take,
                cursor:
                  data.postsByUsername.posts[
                    data.postsByUsername.posts.length - 1
                  ].id,
              },
            });
          }}
        >
          load more
        </Button>
      )}
    </div>
  );
}
