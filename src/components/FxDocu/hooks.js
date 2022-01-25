import { useLocation } from "react-router-dom";
import {
  DEFAULT_FX_DOCU_CONTRACT_NAME,
  DEFAULT_PROD_FX_DOCU_CONTRACT_NAME,
} from "./config.js";
import { contractNameSupported, isProd } from "./utils.js";

export const useFxDocuContract = () => {
  // below is for manually choosing a contract to use
  const { search } = useLocation();
  const overrideContract = new URLSearchParams(search).get("overrideContract");

  return {
    contractName: contractNameSupported(overrideContract)
      ? overrideContract
      : isProd()
        ? DEFAULT_PROD_FX_DOCU_CONTRACT_NAME
        : DEFAULT_FX_DOCU_CONTRACT_NAME,
  };
};
