import { useQuery } from "@apollo/client";
import { FOLLOW_SUGGESTION } from "../../graphql/query/follow-suggestion";
import { UserList } from "../user-list";

export function FollowSuggestion() {
  const { data, loading, fetchMore, variables } = useQuery(FOLLOW_SUGGESTION, {
    variables: {
      take: 7,
    },
  });

  return (
    <div className="grid gap-4">
      <h1>Follow suggestion</h1>
      <UserList
        loading={loading}
        users={data?.followSuggestion.users.map((user) => ({ user }))}
        hasMore={data?.followSuggestion.hasMore}
        fetchMore={() => {
          fetchMore({
            variables: {
              take: variables.take,
              cursor:
                data.followSuggestion.users[
                  data.followSuggestion.users.length - 1
                ].id,
            },
          });
        }}
      />
    </div>
  );
}
