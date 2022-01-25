import { useLocation } from "react-router-dom";
import { isProd } from "../FxDocu/utils.js";
import {
  DEFAULT_FIDUCIARY_CONTRACT_NAME,
  DEFAULT_PROD_FIDUCIARY_CONTRACT_NAME,
} from "./config.js";
import { contractNameSupported } from "./utils.js";

export const useFiduciaryContract = () => {
  // below is for manually choosing a contract to use
  const { search } = useLocation();
  const overrideContract = new URLSearchParams(search).get("overrideContract");

  return {
    contractName: contractNameSupported(overrideContract)
      ? overrideContract
      : isProd()
      ? DEFAULT_PROD_FIDUCIARY_CONTRACT_NAME
      : DEFAULT_FIDUCIARY_CONTRACT_NAME,
  };
};
