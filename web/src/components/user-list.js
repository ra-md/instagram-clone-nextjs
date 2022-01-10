import { Modal } from "./ui/modal";
import { Spinner } from "./ui/spinner";
import { UserItem } from "./user-item";
import { Button } from "./ui/button";

export function UserList({ users, loading, fetchMore, hasMore }) {
  return (
    <>
      {loading ? (
        <div className="flex p-4 justify-center">
          <Spinner color="black" />
        </div>
      ) : (
        <div className="grid gap-4 pb-4 px-7">
          {users && users.length === 0 ? (
            <h1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">
              😢
            </h1>
          ) : (
            users &&
            users.map(({ user }) => (
              <UserItem
                key={user.id}
                avatar={user.avatar}
                username={user.username}
                followStatus={user.followStatus}
                userId={user.id}
              />
            ))
          )}
          {hasMore && (
            <Button
              className="bg-white text-blue-500 w-36 mx-auto hover:bg-blue-100"
              isLoading={loading}
              onClick={fetchMore}
            >
              Load more
            </Button>
          )}
        </div>
      )}
    </>
  );
}
