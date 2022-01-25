import { toast } from "react-toastify";
import { applyPowerMultiplication } from "../../../math.utils.js";
import {
  FX_DOCU_ALLOW_TRANSFER_MODAL,
  FX_DOCU_EXPIRE,
  FX_DOCU_EXPIRE_ERROR,
  FX_DOCU_EXPIRE_SUCCESS,
  FX_DOCU_TRANSFER,
  FX_DOCU_TRANSFER_ERROR,
  FX_DOCU_TRANSFER_SUCCESS,
  FX_DOCU_EXPIRE_MODAL,
  FX_DOCU_DETAILS_MODAL,
  FX_DOCU_JSON_DETAILS_MODAL,
  FX_DOCU_CREATE_MODAL,
} from "../../../redux/actionTypes.js";
import { CSAG_SERVICE } from "../../../redux/serviceEndpoints.js";
import { defaultHeaders } from "../../Auth/config.js";

import { applyProdParam, applyRealmParam } from "../utils.js";

export const allowTransferModal =
  (isVisible = false, data) =>
  (dispatch) =>
    dispatch({
      type: FX_DOCU_ALLOW_TRANSFER_MODAL,
      payload: {
        data,
        isVisible,
      },
    });

export const transfer =
  (contractName, { tokenId, to, from, priority }) =>
  async (dispatch) => {
    dispatch({
      type: FX_DOCU_TRANSFER,
    });

    console.log(contractName);
    console.log(
      JSON.stringify({
        to: btoa(to),
        from: btoa(from),
        tokenId,
        priority,
      })
    );

    const res = await fetch(
      `${CSAG_SERVICE}/transfer?currency=${contractName}${applyRealmParam(
        contractName
      )}${applyProdParam()}`,
      {
        method: "POST",
        headers: { ...defaultHeaders },
        body: JSON.stringify({
          to: btoa(to),
          from: btoa(from),
          tokenId,
          priority,
        }),
      }
    )
      .then((res) => res.json())
      .catch((e) => {
        return dispatch({
          type: FX_DOCU_TRANSFER_ERROR,
          error: e?.message ?? "Unknown error",
        });
      });

    if (typeof res === "number" && !`${res}`?.startsWith(2)) {
      toast.error(`Allow Transfer failed with code: ${res}`);
      return dispatch({
        type: FX_DOCU_TRANSFER_ERROR,
        error: "Error occured, try again.",
      });
    }

    console.log("transfer res", res);

    toast.success(`Transfer allowed to ${to}`);

    return dispatch({
      type: FX_DOCU_TRANSFER_SUCCESS,
    });
  };

export const expireModal =
  (isVisible = false, data) =>
  (dispatch) =>
    dispatch({
      type: FX_DOCU_EXPIRE_MODAL,
      payload: {
        data,
        isVisible,
      },
    });

export const expire =
  (
    contractName,
    { expiry, price, baseCurrency, quoteCurrency, tokenId, isin }
  ) =>
  async (dispatch) => {
    dispatch({
      type: FX_DOCU_EXPIRE,
    });

    const body = {
      maturityDate: expiry,
      priority: 3,
      arrayArgs: {
        amounts: [applyPowerMultiplication(price)],
        stringsAndBytes: [baseCurrency, quoteCurrency].map((value) =>
          btoa(value)
        ),
      },
    };

    console.log("expire fx docu body str", JSON.stringify(body));

    fetch(
      `${CSAG_SERVICE}/expire?currency=${contractName}${applyRealmParam(
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
        console.log("fiduciary deposit expire result", res);
        if (typeof res === "object" && !!res?.transactionRequestUuid) {
          dispatch({
            type: FX_DOCU_EXPIRE_SUCCESS,
            payload: tokenId,
          });
          toast.success(`Expiry successful for ${isin}`);
        } else {
          console.error("expire res", res);
          toast.error(`Expiry failed for ${isin}`);
          dispatch({
            type: FX_DOCU_EXPIRE_ERROR,
            error: `Error. Code: ${res}`,
          });
        }
      })
      .catch((err) => {
        toast.error(
          err?.message ?? `Unknown error during 'Expire' for ${isin}`
        );
        console.error(err);
        dispatch({
          type: FX_DOCU_EXPIRE_ERROR,
          error: `Error. ${err?.message ?? "Unknown"}`,
        });
      });
  };

export const detailsModal =
  (isVisible = false, data) =>
  (dispatch) =>
    dispatch({
      type: FX_DOCU_DETAILS_MODAL,
      payload: {
        data,
        isVisible,
      },
    });

export const jsonDetailsModal =
  (isVisible = false, data) =>
  (dispatch) => {
    dispatch({
      type: FX_DOCU_JSON_DETAILS_MODAL,
      payload: {
        data,
        isVisible,
      },
    });
  };

export const createModal =
  (isVisible = false, data = {}) =>
  (dispatch) => {
    dispatch({
      type: FX_DOCU_CREATE_MODAL,
      payload: {
        data,
        isVisible,
      },
    });
  };
