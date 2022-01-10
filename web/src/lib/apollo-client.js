import { useMemo } from "react";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { concatPagination } from "@apollo/client/utilities";
import merge from "deepmerge";
import isEqual from "lodash/isEqual";

export const APOLLO_STATE_PROP_NAME = "__APOLLO_STATE__";

let apolloClient;

function createApolloClient(ctx) {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_API_URL,
      credentials: "include",
      headers: {
        cookie:
          (typeof window === "undefined"
            ? ctx?.req?.headers.cookie
            : undefined) || "",
      },
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: [],
              merge: (existing, incoming) =>
                mergeCache(existing, incoming, "posts"),
            },
            postsByUsername: {
              keyArgs: ["username"],
              merge: (existing, incoming) =>
                mergeCache(existing, incoming, "posts"),
            },
            comments: {
              keyArgs: ["postId"],
              merge: (existing, incoming) =>
                mergeCache(existing, incoming, "comments"),
            },
            likeList: {
              keyArgs: ["postId"],
              merge: (existing, incoming) =>
                mergeCache(existing, incoming, "users"),
            },
            followers: {
              keyArgs: ["username"],
              merge: (existing, incoming) =>
                mergeCache(existing, incoming, "users"),
            },
            following: {
              keyArgs: ["username"],
              merge: (existing, incoming) =>
                mergeCache(existing, incoming, "users"),
            },
            followSuggestion: {
              keyArgs: [],
              merge: (existing, incoming) =>
                mergeCache(existing, incoming, "users"),
            },
          },
        },
      },
    }),
  });
}

export function initializeApollo(initialState = null, ctx = null) {
  const _apolloClient = apolloClient ?? createApolloClient(ctx);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    });

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function addApolloState(client, pageProps) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
  }

  return pageProps;
}

export function useApollo(pageProps) {
  const state = pageProps[APOLLO_STATE_PROP_NAME];
  const store = useMemo(() => initializeApollo(state), [state]);
  return store;
}

function mergeCache(existing, incoming, type) {
  return {
    ...incoming,
    [type]: [...(existing?.[type] || []), ...incoming[type]],
  };
}
