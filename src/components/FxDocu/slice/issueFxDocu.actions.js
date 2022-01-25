import { applyPowerMultiplication } from "../../../math.utils";
import {
  FX_DOCU_CO_ISSUE_ERROR,
  FX_DOCU_CO_ISSUE_REQUIRED,
  FX_DOCU_CO_ISSUE_SUCCESS,
  FX_DOCU_CO_ISSUE,
  FX_DOCU_ISSUE,
  FX_DOCU_ISSUE_ERROR,
  FX_DOCU_ISSUE_RESET,
  FX_DOCU_ISSUE_SUCCESS,
} from "../../../redux/actionTypes";
import { CSAG_SERVICE } from "../../../redux/serviceEndpoints";
import { defaultHeaders } from "../../Auth/config";
import {
  applyExpiryHourZone,
  applyProdParam,
  applyRealmParam,
  createArrayArgs,
} from "../utils";

export const issueFxDocu = (contractName, data) => async (dispatch) => {
  dispatch({
    type: FX_DOCU_ISSUE,
  });

  let body = {
    priority: data?.priority ?? 5,
    amount: applyPowerMultiplication(data?.notional),
    maturityDate: applyExpiryHourZone(data?.expiryDate, data?.expiryZone),
    uniqueId: data?.identifier,
    currency: data?.investmentCurrency,
    tokenAdministratorBase64: btoa(data?.administrator),
    ownerBase64: btoa(data?.clientAccount),
  };

  if (data?.coIssuer) {
    body.coIssuerBase64 = btoa(data?.coIssuer);
    console.log("fx docu co issuer", data?.coIssuer);
    dispatch({
      type: FX_DOCU_CO_ISSUE_REQUIRED,
    });
  }

  body.arrayArgs = createArrayArgs(data);

  console.log("issueFxDocu body", JSON.stringify(body));

  fetch(
    `${CSAG_SERVICE}/issue?currency=${contractName}${applyRealmParam(
      contractName
    )}${applyProdParam()}`,
    {
      method: "POST",
      headers: { ...defaultHeaders },
      body: JSON.stringify(body),
    }
  )
    .then((res) => res.json())
    .then((res) => {

      if (typeof res === "number" && !`${res}`.startsWith("2")) {
        dispatch({
          type: FX_DOCU_ISSUE_ERROR,
          error: `Error occured. Code: ${res}`,
        });
        return;
      }

      dispatch({
        type: FX_DOCU_ISSUE_SUCCESS,
      });
    })
    .catch((error) => {
      console.error(error);
      dispatch({
        type: FX_DOCU_ISSUE_ERROR,
        error,
      });
    });
};

export const coIssueFxDocu = (contractName, data) => async (dispatch) => {
  dispatch({
    type: FX_DOCU_CO_ISSUE,
  });

  console.log("coIssueFxDocu", data);

  /**
   * @type {F55403TokenIssueRequest}
   */
  const body = {
    priority: data?.priority ?? 5,
    amount: applyPowerMultiplication(data?.notional),
    maturityDate: applyExpiryHourZone(data?.expiryDate, data?.expiryZone),
    uniqueId: data?.identifier,
    currency: data?.investmentCurrency,
    tokenAdministratorBase64: btoa(data?.administrator),
    ownerBase64: btoa(data?.clientAccount),
  };

  body.arrayArgs = createArrayArgs(data);

  console.log("fx docu complete issuance body str", JSON.stringify(body));

  fetch(
    `${CSAG_SERVICE}/completeIssuance?currency=${contractName}${applyRealmParam(
      contractName
    )}${applyProdParam()}`,
    {
      method: "POST",
      headers: { ...defaultHeaders },
      body: JSON.stringify(body),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      console.log("fx docu complete issuance result", res);

      if (typeof res === "object" && !!res?.transactionRequestUuid) {
        dispatch({
          type: FX_DOCU_CO_ISSUE_SUCCESS,
        });
      } else {
        dispatch({
          type: FX_DOCU_CO_ISSUE_ERROR,
        });
      }
    })
    .catch((error) => {
      console.error(error);
      dispatch({
        type: FX_DOCU_CO_ISSUE_ERROR,
        error: error?.message ?? `Unknown error`,
      });
    });
};

export const reset = () => (dispatch) => {
  dispatch({
    type: FX_DOCU_ISSUE_RESET,
  });
};
