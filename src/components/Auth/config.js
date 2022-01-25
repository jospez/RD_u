import { applyBasicAuthHeader } from "./utils";

export const defaultHeaders = (() => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": "ce79f55419284b36a57d207fdc08d71b",
    Authorization: applyBasicAuthHeader(),
  };

  if (!headers["Authorization"]) {
    delete headers["Authorization"];
  }

  return headers;
})();
