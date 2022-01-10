import { initializeApollo, addApolloState } from "../../../lib/apollo-client";
import { COMMENTS } from "../../../graphql/query/comments";
import { CommentSection } from "../../../components/comment/comment-section";
import { CommentForm } from "../../../components/comment/comment-form";
import { useRouter } from "next/router";
import { LayoutBackButton } from "../../../components/ui/layout-back-button";

export default function CommentPage() {
  const router = useRouter();
  const postId = router.query.id;

  return (
    <LayoutBackButton>
      <div className="px-7 flex-1">
        <CommentSection postId={postId} />
      </div>
      <div className="sticky bg-white bottom-0 bg-white px-4 py-2 border-t border-gray-300">
        <CommentForm postId={postId} />
      </div>
    </LayoutBackButton>
  );
}

export async function getServerSideProps(ctx) {
  const apolloClient = initializeApollo(null, ctx);

  try {
    await apolloClient.query({
      query: COMMENTS,
      variables: { postId: ctx.query.id, take: 10 },
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
