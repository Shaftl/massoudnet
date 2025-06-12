export async function uploadToCloudinary(file, onProgress) {
  const isVideo = file.type.startsWith("video/");
  const url = isVideo
    ? "https://api.cloudinary.com/v1_1/dhljprc8i/video/upload"
    : "https://api.cloudinary.com/v1_1/dhljprc8i/image/upload";
  const preset = "massoudnetv2";

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload error"));
    xhr.send(formData);
  });
}
