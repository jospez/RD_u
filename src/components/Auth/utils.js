// can't use imported util here
// import { isProd } from "../FxDocu/utils";

export const applyBasicAuthHeader = () => {
  if (isPublicRoute()) return;

  const getToken = () => {
    const tokenString = sessionStorage.getItem("secret");
    const userToken = JSON.parse(tokenString);
    return userToken?.secret;
  };

  const user = window?.location?.hostname?.includes("prod")
    ? "produser"
    : "devuser";

  return `Basic ${btoa(`${user}:${getToken()}`)}`;
};

/**
 * List of all public path
 */
const PUBLIC_PATHS = ["/fxDocuDetails", "/fiduciaryDetails"];

/**
 * Returns true if current brwser location is
 * configured as public path in PUBLIC_PATHS array
 * @returns {boolean}
 */
export const isPublicRoute = () => {
  const path = window.location.pathname;
  return PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath));
};
