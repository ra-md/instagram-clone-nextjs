import { initializeApollo, addApolloState } from "../lib/apollo-client";
import { Posts } from "../components/home/posts";
import { Layout } from "../components/ui/layout";
import { POSTS } from "../graphql/query/posts";
import { ME } from "../graphql/query/me";
import { useQuery } from "@apollo/client";
import { FollowSuggestion } from "../components/home/follow-suggestion";

export default function Home() {
  const { data } = useQuery(ME);

  return (
    <Layout>
      {data && data.me.followingCount === 0 && data.me.postCount === 0 ? (
        <FollowSuggestion />
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <Posts />
          <aside className="self-start sticky top-0">
            <FollowSuggestion />
          </aside>
        </div>
      )}
    </Layout>
  );
}

export async function getServerSideProps(ctx) {
  const apolloClient = initializeApollo(null, ctx);

  try {
    await Promise.all([
      apolloClient.query({
        query: POSTS,
        variables: { take: 10 },
      }),
      apolloClient.query({
        query: ME,
      }),
    ]);
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
