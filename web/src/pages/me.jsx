import { gql, useQuery, useMutation, cache } from "@apollo/client";
import { initializeApollo, addApolloState } from "../lib/apollo-client";
import { useEffect } from "react";
import { useApollo } from "../lib/apollo-client";

const HELLO = gql`
  query Hello {
    hello
  }
`;

const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export default function Me(pageProps) {
  const query = useQuery(HELLO);
  const [logout] = useMutation(LOGOUT);
  const client = useApollo(pageProps);

  useEffect(() => {
    console.log(client);
  }, []);

  if (query.loading) return <h1>loading...</h1>;

  return (
    <>
      {query.data ? (
        <>
          <button onClick={logout}>logout</button>
          <h1>{query.data.hello}</h1>
        </>
      ) : (
        <p>unauthenticated</p>
      )}
    </>
  );
}

export async function getServerSideProps(ctx) {
  const apolloClient = initializeApollo(null, ctx);

  try {
    await apolloClient.query({
      query: HELLO,
    });
  } catch (err) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return addApolloState(apolloClient, {
    props: {},
  });
}
