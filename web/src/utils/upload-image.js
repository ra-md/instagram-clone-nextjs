export async function uploadImage(file) {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);

  const data = await fetch("http://localhost:4000/upload", {
    credentials: "include",
    method: "POST",
    body: formData,
  });

  return data.json();
}
