import { toast } from "react-toastify";
import {
  COMPLETE_ISSUNACE_FIDUCIARY,
  COMPLETE_ISSUNACE_FIDUCIARY_ERROR,
  COMPLETE_ISSUNACE_FIDUCIARY_SUCCESS,
  CO_ISSUE_FIDUCIARY_NEEDED,
  EXPIRE_EARLY_FIDUCIARY_DEPOSIT,
  EXPIRE_EARLY_FIDUCIARY_DEPOSIT_SUCCESS,
  EXPIRE_FIDUCIARY_DEPOSIT,
  EXPIRE_FIDUCIARY_DEPOSIT_SUCCESS,
  FETCH_FIDUCIARY_PRODUCTS,
  FETCH_FIDUCIARY_PRODUCTS_ERROR,
  FETCH_FIDUCIARY_PRODUCTS_SUCCESS,
  SET_COMPLETE_ISSUNACE_FIDUCIARY_LOCK,
  SET_EXPIRE_EARLY_FD_MODAL_VISIBLE,
  SET_FILTERS_FIDUCIARY_PRODUCTS,
  UPDATE_FIDUCIARY_DEPOSIT_PAUSED_CONTRACTS,
  UPDATE_FIDUCIARY_DEPOSIT_STATUS,
} from "../../../redux/actionTypes";
import { CSAG_SERVICE } from "../../../redux/serviceEndpoints";
import { defaultHeaders } from "../../Auth/config";
import { applyProdParam, applyRealmParam, isProd } from "../../FxDocu/utils";
import { FD_DEV_MAP, FD_PROD_MAP } from "../config";
import { createArrayArgs, extractArrayArgs } from "../utils";

/**
 * a 'contractName' (before 'currency') is actualy contract name e.g. 'FD_v1' that is displayed as well in Ropsten
 * @param {{ contractName: string }} param0
 * @returns
 */
export const fetchFiduciaryProductList = () => async (dispatch) => {
  dispatch({
    type: FETCH_FIDUCIARY_PRODUCTS,
  });

  const contractsNames = Object.keys(isProd() ? FD_PROD_MAP : FD_DEV_MAP);

  const contractsNamesPromises = contractsNames.map((contractName) =>
    fetch(
      `${CSAG_SERVICE}/holdings?currency=${contractName}${applyProdParam()}`,
      {
        headers: { ...defaultHeaders },
      }
    ).then((res) => {
      if (res?.status === 401) {
        sessionStorage.clear();
        window.location.reload();
      }

      return res.json();
    })
  );

  const payload = await Promise.allSettled(contractsNamesPromises)
    .then((rawValues) => {
      /**
       * @type {Array<{tokenIds: string[], contractName: string}>}
       */
      const values = rawValues.flatMap(({ status, value }, i) => {
        if (status === "fulfilled") {
          return {
            tokenIds: value.map(({ tokenId }) => tokenId),
            ownersList: value.map(({ ownerBase64 }) => atob(ownerBase64)),
            contractName: contractsNames[i],
          };
        }
      });

      const promises = values.flatMap(
        ({ tokenIds, ownersList, contractName }) => {
          return tokenIds.map((tokenId, i) =>
            fetch(
              `${CSAG_SERVICE}/termsheet?currency=${contractName}&tokenId=${tokenId}${applyRealmParam(
                contractName
              )}${applyProdParam()}`,
              { headers: { ...defaultHeaders } }
            ).then(async (res) => {
              const value = await res.json().catch(console.error);
              return {
                tokenId,
                contractName,
                owner: ownersList[i],
                value,
              };
            })
          );
        }
      );

      return Promise.allSettled(promises).then((values) => {
        return extractArrayArgs(
          values
            .map(({ status, value }) => {
              if (status === "fulfilled") {
                return {
                  ...value.value,
                  owner: value.owner,
                  tokenId: value.tokenId,
                  contractName: value.contractName,
                };
              }
            })
            .filter(Boolean)
        );
      });
    })
    .catch((e) => {
      return dispatch({
        type: FETCH_FIDUCIARY_PRODUCTS_ERROR,
        error: e?.message ?? "Unknown error",
      });
    });

  return dispatch({
    type: FETCH_FIDUCIARY_PRODUCTS_SUCCESS,
    payload,
  });
};

export const setFilter = (payload) => (dispatch) =>
  dispatch({
    type: SET_FILTERS_FIDUCIARY_PRODUCTS,
    payload,
  });

/**
 * A 'contractName' (before 'currency') is actually contract name (e.g. FD_v1)
 * @param {{ contractName: string, tokenId: string, maturityDate: string, identifier: string }} payload
 * @returns
 */
export const expire = (payload) => async (dispatch) => {
  dispatch({
    type: EXPIRE_FIDUCIARY_DEPOSIT,
    payload,
  });

  const body = {
    maturityDate: payload?.maturityDate,
    priority: 3,
    arrayArgs: {},
  };

  console.log("expire fiduciary deposit body str", JSON.stringify(body));

  fetch(
    `${CSAG_SERVICE}/expire?currency=${payload?.contractName}${applyRealmParam(
      payload?.contractName
    )}${applyProdParam()}`,
    {
      method: "POST",
      headers: { ...defaultHeaders },
      body: JSON.stringify(body),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      console.log("fiduciary deposit expire result", res);
      if (typeof res === "object" && !!res?.transactionRequestUuid) {
        dispatch({
          type: EXPIRE_FIDUCIARY_DEPOSIT_SUCCESS,
          payload: payload?.tokenId,
        });
        toast.success(`Expiry successful for ${payload?.identifier}`);
      } else {
        console.error("expire res", res);
        toast.error(`Expiry failed for ${payload?.identifier}`);
      }
    })
    .catch((err) => {
      toast.error(
        err?.message ??
          `Unknown error during 'Expire' for ${payload?.identifier}`
      );
      console.error(err);
    });
};

/**
 * A 'contractName' (before 'currency') is actually contract name (e.g. FD_v1)
 * @param {{ contractName: string, tokenId: string, identifier: string }} payload
 * @returns
 */
export const earlyExpire = (payload) => async (dispatch) => {
  dispatch({
    type: EXPIRE_EARLY_FIDUCIARY_DEPOSIT,
  });

  const body = {
    tokenId: payload?.tokenId,
    priority: 3,
  };

  console.log("early expire fiduciary deposit body str", JSON.stringify(body));

  // due to lack of dedicated endpoint '/seize' will be used for Early Expure functionality

  fetch(
    `${CSAG_SERVICE}/seize?currency=${payload?.contractName}${applyRealmParam(
      payload?.contractName
    )}${applyProdParam()}`,
    {
      method: "POST",
      headers: { ...defaultHeaders },
      body: JSON.stringify(body),
    }
  )
    .then((res) => res.json())
    .then((res) => {
      console.log("fiduciary deposit early expire result", res);
      if (typeof res === "object" && !!res?.transactionRequestUuid) {
        dispatch({
          type: EXPIRE_EARLY_FIDUCIARY_DEPOSIT_SUCCESS,
          payload: payload?.tokenId,
        });
        toast.success(`Early expiry successful for ${payload?.identifier}`);
        dispatch({
          type: SET_EXPIRE_EARLY_FD_MODAL_VISIBLE,
          payload: { visible: false, data: {} },
        });
        return;
      }

      console.log("early expire res", res);

      if (`${res}`.startsWith("2")) {
        dispatch({
          type: EXPIRE_EARLY_FIDUCIARY_DEPOSIT_SUCCESS,
          payload: payload?.tokenId,
        });
        dispatch({
          type: SET_EXPIRE_EARLY_FD_MODAL_VISIBLE,
          payload: { visible: false, data: {} },
        });
        toast.success(`Early expiry successful for ${payload?.identifier}`);
      } else {
        toast.error(`Early expiry failed for ${payload?.identifier}`);
      }
    })
    .catch((err) => {
      toast.error(
        err?.message ??
          `Unknown error during 'Early expire' for ${payload?.identifier}`
      );
      console.error(err);
    });
};

export const setEarlyExpireVisibility = (visible, data) => (dispatch) => {
  dispatch({
    type: SET_EXPIRE_EARLY_FD_MODAL_VISIBLE,
    payload: { visible, data },
  });
};

/**
 * @param {string} contractName e.g. FD_v1 contract name
 * @param {FiduciaryDepositForm} data
 * @returns
 */
export const completeIssuance = (contractName, data) => async (dispatch) => {
  dispatch({
    type: COMPLETE_ISSUNACE_FIDUCIARY,
  });

  dispatch({
    type: SET_COMPLETE_ISSUNACE_FIDUCIARY_LOCK,
    payload: true,
  });

  /**
   * @type {F55403TokenIssueRequest}
   */
  const body = {};

  // for Fiduciary Deposit this value is always 0
  body.amount = 0;

  body.priority = data?.priority;

  body.maturityDate = data?.maturityDate;
  body.uniqueId = data?.identifier;

  body.tokenAdministratorBase64 = btoa(data?.administrator);
  body.ownerBase64 = btoa(data?.clientAccount);
  body.currency = data?.currencyPrincipalAmount;

  body.arrayArgs = createArrayArgs(data);

  console.log(
    "fiduciary deposit complete issuance body str",
    JSON.stringify(body)
  );

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
      console.log("fiduciary deposit complete issuance result", res);

      if (typeof res === "object" && !!res?.transactionRequestUuid) {
        dispatch({
          type: COMPLETE_ISSUNACE_FIDUCIARY_SUCCESS,
        });
        dispatch({
          type: CO_ISSUE_FIDUCIARY_NEEDED,
          payload: false,
        });
        toast.success(`Co-Issuance successful!.`);
      } else {
        dispatch({
          type: SET_COMPLETE_ISSUNACE_FIDUCIARY_LOCK,
          payload: false,
        });
        dispatch({
          type: COMPLETE_ISSUNACE_FIDUCIARY_ERROR,
          error: { message: "Server error." },
        });
      }
    })
    .catch((error) => {
      console.error(error);
      dispatch({
        type: SET_COMPLETE_ISSUNACE_FIDUCIARY_LOCK,
        payload: false,
      });
      dispatch({
        type: COMPLETE_ISSUNACE_FIDUCIARY_ERROR,
        error,
      });
    });
};

/**
 * @param {{ tokenId: string, contractName: string }} values
 */
export const fetchFrozenFiduciaryDeposit = (values) => async (dispatch) => {
  const promises = values.map(({ tokenId, contractName }) =>
    fetch(
      `${CSAG_SERVICE}/frozen?currency=${contractName}&tokenId=${tokenId}${applyRealmParam(
        contractName
      )}${applyProdParam()}`,
      {
        method: "GET",
        headers: { ...defaultHeaders },
      }
    ).then((res) => res.json())
  );

  return Promise.allSettled(promises)
    .then((rawValues) => {
      const filteredTokenIds = rawValues
        .map(({ status, value }, i) => {
          if (status === "fulfilled" && value?.frozen) {
            return values[i].tokenId;
          }
        })
        .filter(Boolean);
      return dispatch({
        type: UPDATE_FIDUCIARY_DEPOSIT_STATUS,
        payload: { tokenIds: filteredTokenIds, status: "Frozen" },
      });
    })
    .catch(console.error);
};

export const fetchPausedContractsFiduciaryDeposit = () => async (dispatch) => {
  const contractsNames = Object.keys(isProd() ? FD_PROD_MAP : FD_DEV_MAP);

  const promises = contractsNames.map((contractName) =>
    fetch(
      `${CSAG_SERVICE}/paused?currency=${contractName}${applyRealmParam(
        contractName
      )}${applyProdParam()}`,
      {
        method: "GET",
        headers: { ...defaultHeaders },
      }
    ).then((res) => res.json())
  );

  const pausedContracts = await Promise.allSettled(promises)
    .then((values) => {
      return values
        .map(({ status, value }, i) => {
          if (status === "fulfilled" && value?.paused) {
            return contractsNames[i];
          }
        })
        .filter(Boolean);
    })
    .catch(console.error);

  console.log("pausedContracts FD", pausedContracts);

  return dispatch({
    type: UPDATE_FIDUCIARY_DEPOSIT_PAUSED_CONTRACTS,
    payload: pausedContracts,
  });
};

export const freeze = (contractName, body) => async (_dispatch) => {
  console.log("freeze fiduciary deposit body", JSON.stringify(body));
  fetch(
    `${CSAG_SERVICE}/freeze?currency=${contractName}${applyRealmParam(
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
      console.log("freeze res", res);
      if (typeof res === "number") {
        if (res > 199 && res < 300) {
          toast.success(`Freeze action successful!`);
        } else {
          toast.error(`Freeze action. Error code: ${res}`);
        }
      }
    })
    .catch((err) => {
      console.error("freeze", err);
      toast.error(`Freeze action failed due: ${err?.message}`);
    });
};

export const unFreeze = (contractName, body) => async (_dispatch) => {
  console.log("unFreeze fiduciary deposit body", JSON.stringify(body));
  fetch(
    `${CSAG_SERVICE}/unFreeze?currency=${contractName}${applyRealmParam(
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
      console.log("unfreeze res", res);
      if (typeof res === "number") {
        if (res > 199 && res < 300) {
          toast.success(`unFreeze action successful!`);
        } else {
          toast.error(`unFreeze action. Error code: ${res}`);
        }
      }
    })
    .catch((err) => {
      console.error("unfreeze", err);
      toast.error(`unFreeze action failed due: ${err?.message}`);
    });
};

export const pause = (contractName, body) => async (_dispatch) => {
  console.log("pause fiduciary deposit body", JSON.stringify(body));
  fetch(
    `${CSAG_SERVICE}/pause?currency=${contractName}${applyRealmParam(
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
      console.log("pause res", res);
      if (typeof res === "number" && `${res}`.startsWith(2)) {
        toast.success(`pause action successful!`);
      } else {
        toast.error(`pause action. Error code: ${res}`);
      }
    })
    .catch((e) => {
      toast.error(`pause action. Error: ${e?.message ?? "Unknown"}`);
    });
};

export const unPause = (contractName, body) => async (_dispatch) => {
  console.log("unPause fiduciary deposit body", JSON.stringify(body));
  fetch(
    `${CSAG_SERVICE}/unPause?currency=${contractName}${applyRealmParam(
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
      console.log("unPause res", res);
      if (typeof res === "number") {
        if (res > 199 && res < 300) {
          toast.success(`unPause action successful!`);
        } else {
          toast.error(`unPause action. Error code: ${res}`);
        }
      }
    });
};
