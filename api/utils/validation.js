const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export const isObjectId = (value) =>
  typeof value === "string" && OBJECT_ID_PATTERN.test(value);
