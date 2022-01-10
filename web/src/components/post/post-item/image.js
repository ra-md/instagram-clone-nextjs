import NextImage from "next/image";
import { imageURL } from "../../../utils/image-url";

export function Image({ image }) {
  return (
    <div className="relative w-full h-72 md:h-96">
      <NextImage src={imageURL(image)} objectFit="cover" layout="fill" />
    </div>
  );
}
