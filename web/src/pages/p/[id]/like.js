import { LIKE_LIST } from "../../../graphql/query/like-list";
import { LayoutBackButton } from "../../../components/ui/layout-back-button";
import { Spinner } from "../../../components/ui/spinner";
import { Button } from "../../../components/ui/button";
import { useLazyQuery } from "@apollo/client";
import { UserList } from "../../../components/user-list";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Like() {
  const router = useRouter();

  const [likeList, { data, loading, fetchMore, variables, refetch }] =
    useLazyQuery(LIKE_LIST, {
      variables: {
        take: 10,
        postId: router.query.id,
      },
    });

  useEffect(() => {
    if (router.query.id) {
      likeList();
    }
  }, [router.query]);

  return (
    <LayoutBackButton>
      <UserList
        loading={loading}
        users={data?.likeList?.users}
        hasMore={data?.likeList?.hasMore}
        fetchMore={() => {
          fetchMore({
            variables: {
              take: variables.take,
              cursor: data.likeList.users[data.likeList.users.length - 1].id,
            },
          });
        }}
      />
    </LayoutBackButton>
  );
}
