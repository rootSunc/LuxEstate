export const apiRequest = async (url, options = {}) => {
  const { headers = {}, ...restOptions } = options;
  const isApiPath = typeof url === "string" && url.startsWith("/api");
  const response = await fetch(url, {
    credentials: "include",
    ...restOptions,
    headers: {
      ...headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  if (isApiPath && !contentType.includes("application/json")) {
    throw new Error("API returned unexpected response type. Check frontend proxy and backend.");
  }

  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      typeof data === "object" && data?.message
        ? data.message
        : "Request failed";
    throw new Error(message);
  }

  if (typeof data === "object" && data?.success === false) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};
