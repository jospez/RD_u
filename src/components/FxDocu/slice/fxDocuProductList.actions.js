import { toast } from "react-toastify";
import {
  FETCH_FX_DOCU,
  FETCH_FX_DOCU_ERROR,
  FETCH_FX_DOCU_SUCCESS,
  RECALCULATE_TOTALS_FX_DOCU,
  SET_SORTING_FX_DOCU,
  UPDATE_FX_DOCU_PAUSED_CONTRACTS,
  UPDATE_FX_DOCU_STATUS,
} from "../../../redux/actionTypes";
import { CSAG_SERVICE } from "../../../redux/serviceEndpoints";
import { defaultHeaders } from "../../Auth/config";
import { DEV_MAP, PROD_MAP } from "../config.js";
import { applyProdParam, applyRealmParam, isProd } from "../utils";

export const fetchFxDocuProductList = () => async (dispatch) => {
  dispatch({
    type: FETCH_FX_DOCU,
  });

  const contractsNames = Object.keys(isProd() ? PROD_MAP : DEV_MAP);

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
        return values
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
          .filter(Boolean);
      });
    })
    .catch((e) => {
      return dispatch({
        type: FETCH_FX_DOCU_ERROR,
        error: e?.message ?? "Unknown error",
      });
    });

  return dispatch({
    type: FETCH_FX_DOCU_SUCCESS,
    payload,
  });
};

/**
 * @param {{ tokenId: string, contractName: string }} values
 */
export const fetchFrozenFxDocu = (values) => async (dispatch) => {
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
        type: UPDATE_FX_DOCU_STATUS,
        payload: { tokenIds: filteredTokenIds, status: "Frozen" },
      });
    })
    .catch(console.error);
};

export const setSorting = (field, sorting) => async (dispatch) => {
  dispatch({
    type: SET_SORTING_FX_DOCU,
    payload: {
      [field]: !!sorting?.[field]
        ? sorting[field] === "ASC"
          ? null
          : "ASC"
        : "DESC",
    },
  });
};

export const freeze = (contractName, body) => async (dispatch) => {
  console.log("freeze fx docu body", JSON.stringify(body));
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

export const unFreeze = (contractName, body) => async (dispatch) => {
  console.log("unFreeze fx docu body", JSON.stringify(body));
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

export const pause = (contractName, body) => async (dispatch) => {
  console.log("pause fx docu body", JSON.stringify(body));
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

export const unPause = (contractName, body) => async (dispatch) => {
  console.log("unPause fx docu body", JSON.stringify(body));
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

export const seize = (contractName, body) => async (dispatch) => {
  console.log("seize fx docu body", JSON.stringify(body));
  fetch(
    `${CSAG_SERVICE}/seize?currency=${contractName}${applyRealmParam(
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
      console.log("seize res", res);
      if (typeof res === "number") {
        if (res > 199 && res < 300) {
          toast.success(`seize action successful!`);
        } else {
          toast.error(`seize action. Error code: ${res}`);
        }
      }
    });
};

export const fetchPausedContractsFxDocu = () => async (dispatch) => {
  const contractsNames = Object.keys(isProd() ? PROD_MAP : DEV_MAP);

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

  console.log("pausedContracts FX DOCU", pausedContracts);

  return dispatch({
    type: UPDATE_FX_DOCU_PAUSED_CONTRACTS,
    payload: pausedContracts,
  });
};

export const recalculateTotals = () => (dispatch) => {
  dispatch({
    type: RECALCULATE_TOTALS_FX_DOCU,
  });
};
