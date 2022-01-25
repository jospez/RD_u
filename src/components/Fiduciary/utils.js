import {
  applyPowerDivision,
  applyPowerMultiplication,
} from "../../math.utils.js";
import { isProd } from "../FxDocu/utils.js";
import { FD_DEV_MAP, FD_PROD_MAP } from "./config.js";

export const ARGS_AMOUNTS_FIELD_TO_INDEX = {
  PRINCIPAL_AMOUNT: 0,
  INTEREST_AMOUNT: 1,
};

export const roundAccurately = (number, decimalPlaces) =>
  Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces);

export const arrayBufferToHex = (arrayBuffer) => {
  const hashArray = Array.from(new Uint8Array(arrayBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

/**
 * @param {"SHA-1"|"SHA-256"|"SHA-384"|"SHA-512"} algorithm https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
 * @param {Blob} data
 * @returns {{ hash: string, base64: string }}
 */
export const getHash = async (data, algorithm = "SHA-256") => {
  const convert = async (msgUint8) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
    const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
    console.log("hashBuffer.byteLength", hashBuffer.byteLength);
    console.log("base64", _arrayBufferToBase64(hashBuffer));
    return {
      hex: arrayBufferToHex(hashBuffer),
      base64: _arrayBufferToBase64(hashBuffer),
    };
  };

  if (data instanceof Blob) {
    const arrayBuffer = await data.arrayBuffer();
    const msgUint8 = new Uint8Array(arrayBuffer);
    const hashObject = await convert(msgUint8);
    return hashObject;
  }

  console.warn("not a file");
};

/**
 * Formats the value
 * e.g. 1000000 will become 1,000,000
 * @param {number} num
 * @returns
 */
export const thousandsSeparator = (num) =>
  new Intl.NumberFormat("en", {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);

export const sleep = (ms = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 *
 * @param {FiduciaryDepositForm} data
 * @returns {ArrayArgsDto}
 */
export const createArrayArgs = (data) => {
  return {
    dates: [data?.tradeDate ?? "", data?.valueDate ?? ""],
    amounts: [
      data?.principalAmount,
      data?.interestAmount,
      data?.dayCountBasis,
      data?.numberOfDays,
    ].map((value) => applyPowerMultiplication(value)),
    rates: [applyPowerMultiplication(data?.interestRate)],
    addressesBase64: [],
    bools: [],
    stringsAndBytes: [
      btoa(data?.lcrType) ?? "",
      data?.hashOfRABase64 ?? "",
      btoa(data?.businessDays) ?? "",
      btoa(data?.businessDaysConvention) ?? "",
      btoa(data?.dayCountConvention) ?? "",
    ],
  };
};

/**
 * @typedef {{
 *    issueAddress: string,
 *    descriptors: {
 *      dates: string[],
 *      amounts: string[],
 *      rates: string[],
 *      addresses: string[],
 *      stringsAndBytes: string[]
 *    }
 * }} F55403GetTermsheetResponse
 */

/**
 * @typedef {{
 *      amount: number,
 *      maturityDate: string,
 *      uniqueId: string,
 *      currency: string,
 *      coIssuer: string,
 *      index: number,
 *      dates: string[],
 *      amounts: number[],
 *      rates: number[]
 *  }} F55403TermsheetResponseItem
 */

/**
 * @param {Array<F55403TermsheetResponseItem>} response
 */
export const extractArrayArgs = (items) =>
  items.map((response) => {
    const amounts = response?.amounts?.map((v) => applyPowerDivision(v));
    return {
      tokenId: response?.tokenId ?? "",
      identifier:
        response?.uniqueId ?? `fallback-${Math.random().toFixed(5).toString()}`,
      productType: "FD",
      currency: response?.currency ?? "n/a",
      principalAmount:
        amounts?.[ARGS_AMOUNTS_FIELD_TO_INDEX.PRINCIPAL_AMOUNT] ?? "n/a",
      interestAmount:
        amounts?.[ARGS_AMOUNTS_FIELD_TO_INDEX.INTEREST_AMOUNT] ?? "n/a",
      maturityDate: response?.maturityDate ?? "n/a",
      status: "Active",
      contractName: response?.contractName ?? "",
      owner: response?.owner ?? "",
    };
  });

function _arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (var i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 *
 * @param {string} contractName
 * @returns {boolean}
 */
export const contractNameSupported = (contractName) =>
  !!contractName &&
  Object.keys(isProd() ? FD_PROD_MAP : FD_DEV_MAP).includes(contractName);

export const isToday = (isoDate) => {
  const inputDate = new Date(isoDate);
  const today = new Date();
  return (
    inputDate.getDate() == today.getDate() &&
    inputDate.getMonth() == today.getMonth() &&
    inputDate.getFullYear() == today.getFullYear()
  );
};

export const setDateFiledValue = (value) =>
  value && new Date(value).toISOString();

export const addCommas = (num) =>
  !!num ? (num?.toString().endsWith(".") ? num : thousandsSeparator(num)) : "";

export const removeNonNumeric = (num) =>
  num?.toString().endsWith(".") ? num : num?.toString().replace(/[^0-9.]/g, "");

export const getEtherscanLinkForContract = (contractName) =>
  `https://${isProd() ? "" : "ropsten."}etherscan.io/address/${
    isProd() ? FD_PROD_MAP?.[contractName] : FD_DEV_MAP?.[contractName]
  }`;

export const getEtherscanLinkForToken = (contractName, tokenId) =>
  `https://${isProd() ? "" : "ropsten."}etherscan.io/token/${
    isProd() ? FD_PROD_MAP?.[contractName] : FD_DEV_MAP?.[contractName]
  }?a=${tokenId}`;

/**
 *
 * @param {string} input e.g. 2021-12-02T03:00:00Z
 */
export const formatDateString = (input) => {
  try {
    const date = input.split("T")[0];
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  } catch (e) {
    return `can't parse date`;
  }
};

export const loadFiduciaryDeposit = async ({
  fetchFiduciaryProductList,
  fetchFrozenFiduciaryDeposit,
  fetchPausedContractsFiduciaryDeposit,
  // recalculateTotals,
}) => {
  const result = await fetchFiduciaryProductList().catch(console.error);
  if (!!result?.error) return;
  await Promise.all([
    fetchFrozenFiduciaryDeposit(
      result?.payload?.map(({ tokenId, contractName }) => ({
        tokenId,
        contractName,
      }))
    ),
    fetchPausedContractsFiduciaryDeposit(),
  ]).catch(console.error);
  // recalculateTotals();
};
