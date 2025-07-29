/* eslint-disable react-refresh/only-export-components -- context + hook pair */
import { createContext, useContext } from "react";

export const AuthSessionContext = createContext({ authChecking: true });

export function useAuthSession() {
  return useContext(AuthSessionContext);
}
