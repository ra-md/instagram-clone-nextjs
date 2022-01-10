import { HeartIcon as HeartIconSolid } from "@heroicons/react/solid";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/outline";
import { LIKE } from "../../../graphql/mutation/like";
import { UNLIKE } from "../../../graphql/mutation/unlike";
import { useMutation } from "@apollo/client";
import { Spinner } from "../../ui/spinner";
import { gql } from "@apollo/client";

function updateAfterLike(value, postId, cache) {
  const data = cache.readFragment({
    id: `Post:${postId}`,
    fragment: gql`
      fragment __ on Post {
        likeCount
        likeStatus
      }
    `,
  });

  const newLikeCount = value === true ? data.likeCount + 1 : data.likeCount - 1;

  cache.writeFragment({
    id: `Post:${postId}`,
    fragment: gql`
      fragment __ on Post {
        likeCount
        likeStatus
      }
    `,
    data: { likeCount: newLikeCount, likeStatus: value },
  });
}

export function Like({ id, likeStatus }) {
  const [like, { loading: likeLoading }] = useMutation(LIKE, {
    variables: {
      postId: id,
    },
    update: (cache) => updateAfterLike(true, id, cache),
  });

  const [unlike, { loading: unlikeLoading }] = useMutation(UNLIKE, {
    variables: {
      postId: id,
    },
    update: (cache) => updateAfterLike(false, id, cache),
  });

  if (likeStatus === true) {
    return unlikeLoading ? (
      <Spinner color="black" />
    ) : (
      <button onClick={unlike}>
        <HeartIconSolid className="h-8 w-8 text-red-500" />
      </button>
    );
  }

  return likeLoading ? (
    <Spinner color="black" />
  ) : (
    <button onClick={like}>
      <HeartIconOutline className="h-8 w-8 text-black" />
    </button>
  );
}
