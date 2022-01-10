import { Header } from "./header";
import { Image } from "./image";
import { Detail } from "./detail";
import { Card } from "../../ui/card";

export function PostItem({ post }) {
  return (
    <Card p={0}>
      <div className="p-4">
        <Header
          id={post.id}
          avatar={post.author.avatar}
          username={post.author.username}
        />
      </div>
      <Image image={post.image} />
      <div className="p-4">
        <Detail
          likeCount={post.likeCount}
          username={post.author.username}
          caption={post.caption}
          commentCount={post.commentCount}
          createdAt={post.createdAt}
          id={post.id}
          likeStatus={post.likeStatus}
        />
      </div>
    </Card>
  );
}
