import { FOLLOWING } from "../../graphql/query/following";
import { LayoutBackButton } from "../../components/ui/layout-back-button";
import { Spinner } from "../../components/ui/spinner";
import { Button } from "../../components/ui/button";
import { useLazyQuery } from "@apollo/client";
import { UserList } from "../../components/user-list";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Following() {
  const router = useRouter();

  const [following, { data, loading, fetchMore, variables, refetch }] =
    useLazyQuery(FOLLOWING, {
      variables: {
        take: 10,
        username: router.query.username,
      },
    });

  useEffect(() => {
    if (router.query.username) {
      following();
    }
  }, [router.query]);

  return (
    <LayoutBackButton>
      <UserList
        loading={loading}
        users={data?.following.users}
        hasMore={data?.following.hasMore}
        fetchMore={() => {
          fetchMore({
            variables: {
              take: variables.take,
              cursor: data.following.users[data.following.users.length - 1].id,
            },
          });
        }}
      />
    </LayoutBackButton>
  );
}
