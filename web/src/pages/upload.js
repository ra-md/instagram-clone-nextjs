import { useState } from "react";
import cld from "../utils/image-url";

export default function Upload() {
  const [file, setFile] = useState("");

  const my = cld.image("default");

  console.log(my.toURL());

  function upload() {
    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:4000/upload", {
      credentials: "include",
      method: "POST",
      body: formData,
    }).then(async (res) => {
      const w = await res.json();
      console.log(w);
    });
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => {
          setFile(event.target.files[0]);
        }}
      />
      <button onClick={upload}>upload</button>
    </div>
  );
}
