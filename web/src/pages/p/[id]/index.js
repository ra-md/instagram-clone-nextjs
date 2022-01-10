import { initializeApollo, addApolloState } from "../../../lib/apollo-client";
import { Layout } from "../../../components/ui/layout";
import { POST } from "../../../graphql/query/post";
import { CommentSection } from "../../../components/comment/comment-section";
import { useQuery } from "@apollo/client";
import { Header } from "../../../components/post/post-item/header";
import { Detail } from "../../../components/post/post-item/detail";
import { useRouter } from "next/router";
import { imageURL } from "../../../utils/image-url";
import { CommentForm } from "../../../components/comment/comment-form";
import NextImage from "next/image";
import { PostItem } from "../../../components/post/post-item";

export default function PostPage() {
  const router = useRouter();

  const { data } = useQuery(POST, {
    variables: {
      id: router.query.id,
    },
  });

  const md = data && (
    <div className="border border-gray-300 md:flex">
      <div className="flex-1 relative h-64 md:h-auto">
        <NextImage
          src={imageURL(data.post.image)}
          objectFit="cover"
          layout="fill"
        />
      </div>
      <div className="flex flex-col w-80">
        <div className="p-4 bg-white border-b border-gray-300 sticky top-0 z-10">
          <Header
            avatar={data.post.author.avatar}
            username={data.post.author.username}
            id={router.query.id}
            redirectAfterDelete={true}
          />
        </div>
        <div className="max-h-64 h-56 overflow-y-auto">
          {data.post.caption && (
            <p className="mb-4 p-4 border-b border-gray-300">
              {data.post.caption}
            </p>
          )}
          <div className="px-4">
            <CommentSection postId={data.post.id} />
          </div>
        </div>
        <div className="p-4 bg-white border-t border-gray-300 sticky bottom-0">
          <Detail
            likeCount={data.post.likeCount}
            createdAt={data.post.createdAt}
            likeStatus={data.post.likeStatus}
            id={data.post.id}
          />
          <div className="mt-4">
            <CommentForm postId={router.query.id} />
          </div>
        </div>
      </div>
    </div>
  );

  const base = data && <PostItem post={data.post} />;

  return (
    <Layout>
      {data ? (
        <>
          <div className="hidden md:block">{md}</div>
          <div className="block md:hidden">{base}</div>
        </>
      ) : (
        <h1 className="text-center">Post not found!</h1>
      )}
    </Layout>
  );
}

export async function getServerSideProps(ctx) {
  const apolloClient = initializeApollo(null, ctx);

  try {
    await apolloClient.query({
      query: POST,
      variables: { id: ctx.query.id },
    });
  } catch (err) {
    console.log(err);

    if (err.message === "not authenticated") {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    return { props: {} };
  }

  return addApolloState(apolloClient, {
    props: {},
  });
}
