export const PROPERTY_IMAGE_FALLBACK = "/pictures/pexels-pixabay-164522.jpg";

const LEGACY_FIREBASE_HOST = "firebasestorage.googleapis.com";
const LEGACY_FIREBASE_BUCKET = "lux-estate-5643b.appspot.com";
const TIMESTAMP_PREFIX = /^\d{13}/;

const LOCAL_PICTURE_FILENAMES = new Set([
  "12a45d8d12dfc27f785c115754f4c378-cc_ft_1344.webp",
  "pexels-atomlaborblog-1105754.jpg",
  "pexels-felipepelaquim-1895031.jpg",
  "pexels-frans-van-heerden-201846-1438834.jpg",
  "pexels-heyho-7031413.jpg",
  "pexels-imphoto-32870.jpg",
  "pexels-lexi-lauwers-1431940-2921077.jpg",
  "pexels-lina-3625713.jpg",
  "pexels-madbyte-36362.jpg",
  "pexels-mark-neal-201020-2859249.jpg",
  "pexels-orlovamaria-4916481.jpg",
  "pexels-pixabay-164522.jpg",
  "pexels-pixabay-209274.jpg",
  "pexels-pixabay-210538.jpg",
  "pexels-pixabay-415687.jpg",
  "pexels-pixabay-534228.jpg",
  "pexels-pixabay-53610.jpg",
  "pexels-rachel-claire-6752296.jpg",
  "pexels-rama-dhan-862484-1756106.jpg",
]);

const getLegacyFirebaseObjectName = (url) => {
  if (typeof url !== "string") return "";

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== LEGACY_FIREBASE_HOST) return "";

    const objectPathPrefix = `/v0/b/${LEGACY_FIREBASE_BUCKET}/o/`;
    if (!parsedUrl.pathname.startsWith(objectPathPrefix)) return "";

    const encodedObjectName = parsedUrl.pathname.slice(objectPathPrefix.length);
    return decodeURIComponent(encodedObjectName).split("/").pop() || "";
  } catch {
    return "";
  }
};

export const getLegacyFirebaseImagePath = (url) => {
  const objectName = getLegacyFirebaseObjectName(url);
  if (!objectName) return "";

  const localFileName = objectName.replace(TIMESTAMP_PREFIX, "");
  if (!LOCAL_PICTURE_FILENAMES.has(localFileName)) return "";

  return `/pictures/${localFileName}`;
};

export const isLegacyFirebaseImageUrl = (url) =>
  Boolean(getLegacyFirebaseObjectName(url));

export const resolveListingImageUrl = (
  url,
  fallback = PROPERTY_IMAGE_FALLBACK
) => {
  const trimmedUrl = typeof url === "string" ? url.trim() : "";
  if (!trimmedUrl) return fallback;

  return (
    getLegacyFirebaseImagePath(trimmedUrl) ||
    (isLegacyFirebaseImageUrl(trimmedUrl) ? fallback : trimmedUrl)
  );
};

export const setImageFallback = (
  event,
  fallback = PROPERTY_IMAGE_FALLBACK
) => {
  const image = event.currentTarget;
  const fallbackUrl = new URL(fallback, window.location.origin).href;
  if (image.src === fallbackUrl) return;
  image.src = fallback;
};
