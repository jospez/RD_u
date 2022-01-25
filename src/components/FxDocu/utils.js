import { applyPowerMultiplication } from "../../math.utils";
import { calcDaysLeft } from "../../utils";
import {
  ARGS_AMOUNTS_FIELD_TO_INDEX,
  ARGS_DATES_FIELD_TO_INDEX,
  ARGS_RATES_FIELD_TO_INDEX,
  ARGS_STRINGS_FIELD_TO_INDEX,
  DEV_MAP,
  PROD_MAP,
  REALM_MAP,
  REALM_MAP_PROD,
} from "./config";

export const isProd = () => window?.location?.hostname?.includes("prod");

export const getRealm = (contractName) =>
  Object.keys(isProd() ? REALM_MAP_PROD : REALM_MAP).find((key) =>
    (isProd() ? REALM_MAP_PROD : REALM_MAP)[key].includes(contractName)
  );

export const getContractAddress = (contractName) =>
  isProd() ? PROD_MAP[contractName] : DEV_MAP[contractName];

export const applyProdParam = (prefix = "&") =>
  isProd() ? `${prefix}env=prod` : "";

export const applyRealmParam = (contractName, prefix = "&") => {
  const realm = `${prefix}realm=${getRealm(contractName)}`;

  if (!realm) throw new Error("Realm not configured properly");
  return realm;
};

export const FIELD_TO_SORT_TYPE = {
  isin: "TEXT",
  productType: "TEXT",
  investmentCurrency: "TEXT",
  underlying: "TEXT",
  strike: "NUM",
  notional: "NUM",
  expiry: "DATE",
  status: "TEXT",
};

export const getInvestCurrency = (investBase, contractName) => {
  const [currencyPair, version] = contractName.split("_");

  return investBase
    ? currencyPair.substring(0, 3)
    : currencyPair.substring(3, 6);
};

export const getAltCurrency = (
  baseCurrency,
  quoteCurrency,
  investmentCurrency
) => (baseCurrency === investmentCurrency ? quoteCurrency : baseCurrency);

export const getAltCurrencyLegacy = (investBase, contractName) => {
  return getInvestCurrency(!investBase, contractName);
};

export const formatTimeRemaining = (expiry) =>
  `${expiry.split("T")[0]} ${expiry.split("T")[1].substring(0, 5)} (${
    new Date(expiry)
      .toLocaleTimeString("en-us", { timeZoneName: "short" })
      .split(" ")[2]
  }) (${calcDaysLeft(expiry)})`;

export const currencyPairAlias = (currencyPair) =>
  `${currencyPair.substring(3, 6)}${currencyPair.substring(0, 3)}`;

export const loadFxDocu = async ({
  fetchFxDocuProductList,
  fetchFrozenFxDocu,
  fetchPausedContractsFxDocu,
  recalculateTotals,
}) => {
  const result = await fetchFxDocuProductList().catch(console.error);
  if (!!result?.error) return;
  await Promise.all([
    fetchFrozenFxDocu(
      result?.payload?.map(({ tokenId, contractName }) => ({
        tokenId,
        contractName,
      }))
    ),
    fetchPausedContractsFxDocu(),
  ]).catch(console.error);
  recalculateTotals();
};

export const replaceSlashes = (_key, value) =>
  typeof value === "string" ? value.replace(/\//g, "\\/") : value;

export const exportToJson = (filename, objectData) => {
  console.log("exportToJson", objectData);
  let contentType = "application/json;charset=utf-8;";
  if (navigator?.msSaveOrOpenBlob) {
    const blob = new Blob(
      [
        decodeURIComponent(
          encodeURI(
            JSON.stringify(objectData, replaceSlashes).replace(/\\\\/g, "\\")
          )
        ),
      ],
      { type: contentType }
    );
    navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    let a = document.createElement("a");
    a.download = filename;
    a.href = `data:${contentType},${encodeURIComponent(
      JSON.stringify(objectData, replaceSlashes).replace(/\\\\/g, "\\")
    )}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

/**
 * @param {ISO date} date
 * @returns 3.Oct 2021
 */
export const getExportFormattedDate = (date) =>
  `${new Date(date).getDate()}.${new Date(date).toLocaleString("en", {
    month: "short",
  })} ${new Date(date).getFullYear()}`;

export const extractArrayArgs = (item) => {
  return {
    tradeDate: item?.dates[ARGS_DATES_FIELD_TO_INDEX.TRADE_DATE],
    valueDate: item?.dates[ARGS_DATES_FIELD_TO_INDEX.VALUE_DATE],
    strike: item?.amounts[ARGS_AMOUNTS_FIELD_TO_INDEX.STRIKE],
    convertedAmount:
      item?.amounts[ARGS_AMOUNTS_FIELD_TO_INDEX.CONVERTED_AMOUNT],
    nonConvertedAmount:
      item?.amounts[ARGS_AMOUNTS_FIELD_TO_INDEX.NON_CONVERTED_AMOUNT],
    coupon: item?.rates[ARGS_RATES_FIELD_TO_INDEX.COUPON],
    baseCurrency: atob(
      item?.stringsAndBytes[ARGS_STRINGS_FIELD_TO_INDEX.BASE_CURRENCY]
    ),
    quoteCurrency: atob(
      item?.stringsAndBytes[ARGS_STRINGS_FIELD_TO_INDEX.QUOTE_CURRENCY]
    ),
    comment: atob(item?.stringsAndBytes[ARGS_STRINGS_FIELD_TO_INDEX.COMMENT]),
    investBase: true,
  };
};

export const createArrayArgs = (data) => {
  return {
    dates: [data?.tradeDate ?? "", data?.valueDate ?? ""],
    amounts: [
      data?.strike,
      data?.convertedAmount,
      data?.nonConvertedAmount,
    ].map((value) => applyPowerMultiplication(value)),
    rates: [data?.coupon].map((value) => applyPowerMultiplication(value)),
    bools: [],
    addressesBase64: [],
    stringsAndBytes: [
      data?.baseCurrency,
      data?.quoteCurrency,
      data?.comment,
    ].map((value) => btoa(value)),
  };
};

/**
 *
 * @param {string} contractName
 * @returns {boolean}
 */
export const contractNameSupported = (contractName) =>
  !!contractName &&
  Object.keys(isProd() ? PROD_MAP : DEV_MAP).includes(contractName);

export const applyExpiryHourZone = (expiry, hour) => {
  console.log(hour);
  const zoneDate = new Date(new Date(expiry).setHours(hour)).toLocaleString(
    "en-US",
    {
      timeZone: +hour === 10 ? "America/New_York" : "Asia/Tokyo",
    }
  );

  console.log(zoneDate, new Date(zoneDate).toISOString());

  return new Date(zoneDate).toISOString();
};

export const getEtherscanLinkForContract = (contractName) =>
  `https://${
    isProd() ? "" : "ropsten."
  }etherscan.io/address/${getContractAddress(contractName)}`;

export const getEtherscanLinkForToken = (contractName, tokenId) =>
  `https://${isProd() ? "" : "ropsten."}etherscan.io/token/${getContractAddress(
    contractName
  )}?a=${tokenId}`;
