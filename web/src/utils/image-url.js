import { Cloudinary } from "@cloudinary/url-gen";

const cld = new Cloudinary({
  cloud: {
    cloudName: "dwjh6yee4",
  },
  url: {
    secure: true,
  },
});

export function imageURL(id) {
  const image = cld.image(id);
  return image.toURL();
}
