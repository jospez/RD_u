import {
  extractArrayArgs,
  getAltCurrency,
  getAltCurrencyLegacy,
  getInvestCurrency,
} from "../utils.js";
import { applyPowerDivision } from "../../../math.utils.js";

const _legacyFormatNormalization = (entity) => ({
  amount: entity?.amount,
  comment: entity?.comment,
  convertedAmount: entity?.convertedAmount,
  coupon: entity?.coupon,
  expiry: entity?.expiry,
  investBase: entity?.investBase,
  isin: entity?.isin,
  nonConvertedAmount: entity?.nonConvertedAmount,
  strike: entity?.strike,
  owner: entity?.owner,
  tokenId: entity?.tokenId,
  contractName: entity?.contractName,
  investmentCurrency: getInvestCurrency(
    entity?.investBase,
    entity?.contractName
  ),
  altCurrency: getAltCurrencyLegacy(entity?.investBase, entity?.contractName),
  underlying: entity?.contractName?.split("_")?.[0],
  currency: entity?.contractName?.split("_")?.[0], // for feedPrice legacy compatibility
  strike: applyPowerDivision(entity?.strike),
  notional: applyPowerDivision(entity?.amount),
  productType: "FX DOCU",
  status: "Active",
  contractPaused: false,
});

const currentFormatNormalization = (entity) => {
  return {
    amount: applyPowerDivision(entity?.amount),
    comment: entity?.comment,
    convertedAmount: applyPowerDivision(entity?.convertedAmount),
    coupon: applyPowerDivision(entity?.coupon),
    expiry: entity?.maturityDate,
    investBase: entity?.investBase,
    isin: entity?.uniqueId,
    nonConvertedAmount: applyPowerDivision(entity?.nonConvertedAmount),
    strike: applyPowerDivision(entity?.strike),
    owner: entity?.owner,
    tokenId: entity?.tokenId,
    contractName: entity?.contractName,
    investmentCurrency: entity?.currency,
    altCurrency: getAltCurrency(
      entity?.baseCurrency,
      entity?.quoteCurrency,
      entity?.currency
    ),
    underlying: `${entity?.baseCurrency}${entity?.quoteCurrency}`,
    currency: entity?.currency, // for feedPrice legacy compatibility
    notional: applyPowerDivision(entity?.amount),
    productType: "FX DOCU",
    status: "Active",
    contractPaused: false,
    isNewSchema: true, // todo remove after full migration
    tradeDate: entity?.tradeDate,
    valueDate: entity?.valueDate,
    baseCurrency: entity?.baseCurrency,
    quoteCurrency: entity?.quoteCurrency,
  };
};

export const normalize = (entities) =>
  entities.map((entity) =>
    !!entity?.amounts
      ? /**
         * as we have to support two different payload schemas for product list below
         * makes distinction in which format data arrives
         */
        currentFormatNormalization({
          ...entity,
          ...extractArrayArgs(entity),
        })
      : _legacyFormatNormalization(entity)
  );
