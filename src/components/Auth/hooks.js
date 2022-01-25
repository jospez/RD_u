import { useState } from "react";
import { CSAG_SERVICE } from "../../redux/serviceEndpoints";
import { isProd } from "../FxDocu/utils";
import { defaultHeaders } from "./config";

const errorMessages = [
  "This secret is of no use here.",
  "You don't seem to be enlightened with the secret.",
  "You shall search for the true secret before coming here.",
  "All your actions are beeing recorded and consequences will be drawn.",
];

export const useLogin = () => {
  const [errorCount, setErrorCount] = useState(0);
  const [error, setError] = useState();
  const [loading, setLoading] = useState("IDLE");

  const login = async (secret, setToken) => {
    setLoading("PENDING");

    fetch(`${CSAG_SERVICE}/login`, {
      headers: {
        ...defaultHeaders,
        Authorization: `Basic ${btoa(
          `${isProd() ? "produser" : "devuser"}:${secret}`
        )}`,
      },
    })
      .then((res) => {
        if (res?.status === 401) {
          setError({
            message: errorMessages[errorCount > 3 ? 3 : errorCount],
          });
          setLoading("NOT_LOADED");
          setErrorCount((prev) => prev + 1);
          return;
        }

        console.log("Opening the gate");
        setToken({ secret });
        setLoading("LOADED");
        window.location.reload();
      })
      .catch((err) => {
        if (err?.message === "Server error") {
          setError({
            message: "Server error",
          });
          setLoading("NOT_LOADED");
        } else {
          setError({
            message: errorMessages[errorCount > 3 ? 3 : errorCount],
          });
          setLoading("NOT_LOADED");
          setErrorCount((prev) => prev + 1);
        }
      });
  };

  return {
    errorCount,
    error,
    loading,
    login,
  };
};

export const useToken = () => {
  const getToken = () => {
    const tokenString = sessionStorage.getItem("secret");
    const userToken = JSON.parse(tokenString);
    return userToken?.secret;
  };

  const [token, setToken] = useState(getToken());

  const saveToken = (userToken) => {
    sessionStorage.setItem("secret", JSON.stringify(userToken));
    setToken(userToken.secret);
  };

  const clear = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  return {
    setToken: saveToken,
    token,
    clear,
  };
};
