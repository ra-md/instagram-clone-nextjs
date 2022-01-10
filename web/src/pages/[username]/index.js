import { initializeApollo, addApolloState } from "../../lib/apollo-client";
import { USER } from "../../graphql/query/user";
import { UserInfo } from "../../components/profile/user-info";
import { Layout } from "../../components/ui/layout";
import { Posts } from "../../components/profile/posts";
import { POSTS_BY_USERNAME } from "../../graphql/query/user-posts";

export default function ProfilePage(props) {
  return (
    <Layout>
      <UserInfo />
      <Posts />
    </Layout>
  );
}

export async function getServerSideProps(ctx) {
  const apolloClient = initializeApollo(null, ctx);

  try {
    await Promise.all([
      apolloClient.query({
        query: USER,
        variables: {
          username: ctx.query.username,
        },
      }),
      apolloClient.query({
        query: POSTS_BY_USERNAME,
        variables: {
          take: 10,
          username: ctx.query.username,
        },
      }),
    ]);
  } catch (err) {
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
