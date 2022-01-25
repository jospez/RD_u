import {
  ISSUE_FIDUCIARY,
  ISSUE_FIDUCIARY_SUCCESS,
  ISSUE_FIDUCIARY_ERROR,
  CO_ISSUE_FIDUCIARY_NEEDED,
  SHOW_FIDUCIARY_CREATION_MODAL,
  HIDE_FIDUCIARY_CREATION_MODAL,
} from "../../../redux/actionTypes.js";
import { CSAG_SERVICE } from "../../../redux/serviceEndpoints.js";
import { defaultHeaders } from "../../Auth/config.js";
import { applyProdParam, applyRealmParam } from "../../FxDocu/utils.js";

import { sleep, createArrayArgs } from "../utils.js";

/**
 * @typedef {import('../../components/Fiduciary/FiduciaryCreateModal.js').FiduciaryDepositForm} FiduciaryDepositForm
 */

/**
 * type definitions for a CryptoStorage API
 *
 * @typedef {{
 *      dates: string[],
 *      amounts: number[],
 *      rates: number[],
 *      addressesBase64: string[],
 *      bools: boolean[],
 *      stringsAndBytes: Array<string[]>
 *  }} ArrayArgsDto
 *
 * @typedef {{
 *      priority: number,
 *      amount: number,
 *      tradeDate: Date,
 *      valueDate: Date,
 *      maturityDate: Date,
 *      ownerBase64: string,
 *      coIssuerBase64: string,
 *      tokenAdministratorBase64: string,
 *      arrayArgs: ArrayArgsDto
 * }} F55403TokenIssueRequest
 */

/**
 * Technical note
 *
 * For Fiduciary Deposit we map values for `ArrayArgsDto` as follows:
 *
 * For `ArrayArgsDto.dates` Contract requires this to be of length 0
 *
 * For `ArrayArgsDto.amounts`, Contract requires this to be of length 4:
 *      0: Principal Amount
 *      1: Interest Amount
 *      2: Number Of Days
 *      3: Day Count Basis
 *
 *  For `ArrayArgsDto.rates` Contract requires this to be of length 1:
 *      0: Interest Rate
 *
 *  For `ArrayArgsDto.addresses` Contract requires this to be of length 0
 *
 *  For `ArrayArgsDto.bools` Contract requires this to be of length 0
 *
 *  For `ArrayArgsDto.stringsAndBytes` Contract requires this to be of length 4:
 *      0: Currency code (for principal amount and interest amount)
 *      1: Unique identifier
 *      2: Bank Client LCR Type
 *      3: Hash of Registration Agreement
 */

/**
 * @param {string} contractName e.g. FD_v1 contract name
 * @param {FiduciaryDepositForm} data
 * @param {number} version e.g. 1
 * @returns
 */
export function issueFiduciaryDeposit(contractName, data, version = 1) {
  let coIssuance = false;
  /**
   * @type {F55403TokenIssueRequest}
   */
  const body = {};

  // for Fiduciary Deposit this value is always 0
  body.amount = 0;

  body.priority = data?.priority;

  body.maturityDate = data?.maturityDate;
  body.uniqueId = data?.identifier;

  if (data?.coIssuer) {
    coIssuance = true;
    body.coIssuerBase64 = btoa(data.coIssuer);
  }

  body.tokenAdministratorBase64 = btoa(data?.administrator);
  body.ownerBase64 = btoa(data?.clientAccount);
  body.currency = data?.currencyPrincipalAmount;

  body.arrayArgs = createArrayArgs(data);

  console.log("issueFiduciaryDeposit body str", JSON.stringify(body));

  return async (dispatch) => {
    dispatch({
      type: ISSUE_FIDUCIARY,
    });

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
      .then(async (response) => {
        if (!response) {
          dispatch({
            type: ISSUE_FIDUCIARY_ERROR,
            error: "Unknown error.",
          });
        }

        const statusCode = await response?.json().catch(console.error);
        console.log("issueFiduciaryDeposit statusCode", statusCode);

        if (`${statusCode}`.startsWith("2")) {
          console.log(`Issue created with 201`);

          if (coIssuance) {
            dispatch({
              type: CO_ISSUE_FIDUCIARY_NEEDED,
              payload: true,
            });
          }
          dispatch({
            type: ISSUE_FIDUCIARY_SUCCESS,
          });
        }

        if (`${statusCode}`.startsWith("4")) {
          dispatch({
            type: ISSUE_FIDUCIARY_ERROR,
            error: "Bad request. Verify fields values and try again.",
          });
        }

        if (`${statusCode}`.startsWith("5")) {
          dispatch({
            type: ISSUE_FIDUCIARY_ERROR,
            error: "Unexpected error. Try again later.",
          });
        }
      })
      .catch((e) => {
        console.error(e);
        dispatch({
          type: ISSUE_FIDUCIARY_ERROR,
          error: "Unexpected error. Try again later.",
        });
      });
  };
}

export function showFiduciaryCreationModal(payload) {
  return (dispatch) =>
    dispatch({
      type: SHOW_FIDUCIARY_CREATION_MODAL,
      payload,
    });
}

export function hideFiduciaryCreationModal() {
  return (dispatch) =>
    dispatch({
      type: HIDE_FIDUCIARY_CREATION_MODAL,
    });
}
