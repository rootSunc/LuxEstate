import { apiRequest } from "./api";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const validateImageFile = (file) => {
  if (!file) return "Please select an image";
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Only JPG, PNG, WEBP or GIF images are allowed";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image size must be less than or equal to 5MB";
  }
  return null;
};

export const uploadImageFile = async (file) => {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const data = await apiRequest("/api/listing/upload", {
    method: "POST",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!data?.url) {
    throw new Error("Image upload failed");
  }

  return data.url;
};
