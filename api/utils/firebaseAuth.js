import jwt from "jsonwebtoken";

const FIREBASE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let cachedCerts = null;
let cachedCertsExpiresAt = 0;

const getMaxAgeMs = (cacheControl) => {
  const match = String(cacheControl || "").match(/max-age=(\d+)/);
  if (!match) return 60 * 60 * 1000;
  return Number(match[1]) * 1000;
};

const getFirebaseCerts = async () => {
  if (cachedCerts && Date.now() < cachedCertsExpiresAt) {
    return cachedCerts;
  }

  const response = await fetch(FIREBASE_CERTS_URL);
  if (!response.ok) {
    throw new Error("Unable to fetch Firebase signing certificates");
  }

  cachedCerts = await response.json();
  cachedCertsExpiresAt =
    Date.now() + getMaxAgeMs(response.headers.get("cache-control"));
  return cachedCerts;
};

export const verifyFirebaseIdToken = async (idToken) => {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID must be configured for Google sign-in");
  }

  if (typeof idToken !== "string" || idToken.length < 20) {
    throw new Error("Invalid Firebase ID token");
  }

  const decoded = jwt.decode(idToken, { complete: true });
  const keyId = decoded?.header?.kid;
  if (!keyId || decoded?.header?.alg !== "RS256") {
    throw new Error("Invalid Firebase ID token header");
  }

  const certs = await getFirebaseCerts();
  const signingCert = certs[keyId];
  if (!signingCert) {
    throw new Error("Unknown Firebase signing certificate");
  }

  return jwt.verify(idToken, signingCert, {
    algorithms: ["RS256"],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  });
};
