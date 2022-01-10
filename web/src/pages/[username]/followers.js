import { FOLLOWERS } from "../../graphql/query/followers";
import { LayoutBackButton } from "../../components/ui/layout-back-button";
import { Spinner } from "../../components/ui/spinner";
import { Button } from "../../components/ui/button";
import { useLazyQuery } from "@apollo/client";
import { UserList } from "../../components/user-list";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Followers() {
  const router = useRouter();

  const [followers, { data, loading, fetchMore, variables, refetch }] =
    useLazyQuery(FOLLOWERS, {
      variables: {
        take: 10,
        username: router.query.username,
      },
    });

  useEffect(() => {
    if (router.query.username) {
      followers();
    }
  }, [router.query]);

  return (
    <LayoutBackButton>
      <UserList
        loading={loading}
        users={data?.followers.users}
        hasMore={data?.followers.hasMore}
        fetchMore={() => {
          fetchMore({
            variables: {
              take: variables.take,
              cursor: data.followers.users[data.followers.users.length - 1].id,
            },
          });
        }}
      />
    </LayoutBackButton>
  );
}
