import { initializeApollo, addApolloState } from "../lib/apollo-client";
import { ME } from "../graphql/query/me";

export async function checkAuth(ctx) {
  const apolloClient = initializeApollo(null, ctx);

  try {
    const { data } = await apolloClient.query({
      query: ME,
    });

    if (data.me) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  } catch (err) {
    console.log(err);
    return { props: {} };
  }
}
