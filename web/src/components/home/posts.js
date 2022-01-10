import { useQuery } from "@apollo/client";
import { POSTS } from "../../graphql/query/posts";
import { Button } from "../ui/button";
import { PostItem } from "../post/post-item";

export function Posts() {
  const { data, fetchMore, variables, loading } = useQuery(POSTS, {
    variables: { take: 10 },
  });

  return (
    <div className="col-span-2">
      <div className="grid gap-4">
        {data && data.posts.posts.length === 0 ? (
          <h1 className="text-center">No posts</h1>
        ) : (
          data.posts.posts.map((post) => {
            return <PostItem key={post.id} post={post} />;
          })
        )}
      </div>
      {data && data.posts.hasMore && (
        <Button
          className="mt-8 mx-auto w-36 text-blue-500 bg-white hover:bg-blue-100"
          isLoading={loading}
          onClick={() => {
            fetchMore({
              variables: {
                take: variables.take,
                cursor: data.posts.posts[data.posts.posts.length - 1].id,
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
