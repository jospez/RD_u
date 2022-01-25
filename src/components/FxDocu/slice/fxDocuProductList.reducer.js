import {
  FETCH_FX_DOCU,
  FETCH_FX_DOCU_ERROR,
  FETCH_FX_DOCU_SUCCESS,
  SET_FILTERS_FX_DOCU,
  SET_SORTING_FX_DOCU,
  UPDATE_FX_DOCU_STATUS,
  UPDATE_FX_DOCU_PAUSED_CONTRACTS,
  RECALCULATE_TOTALS_FX_DOCU,
} from "../../../redux/actionTypes";
import { currencyPairAlias, FIELD_TO_SORT_TYPE } from "../utils";
import { normalize } from "./fxDocuProductList.adapter.js";

const defaultHighlightedCurrencies = ["USDEUR", "USDCHF", "USDCNY", "GBPCHF"];

const initialTotals = {
  active: {
    sum: 0,
    USDEUR: 0,
    USDCHF: 0,
    USDCNY: 0,
    GBPCHF: 0,
    other: 0,
  },
  converted: {
    sum: 0,
    USDEUR: 0,
    USDCHF: 0,
    USDCNY: 0,
    GBPCHF: 0,
    other: 0,
  },
  paused: {
    sum: 0,
    USDEUR: 0,
    USDCHF: 0,
    USDCNY: 0,
    GBPCHF: 0,
    other: 0,
  },
  frozen: {
    sum: 0,
    USDEUR: 0,
    USDCHF: 0,
    USDCNY: 0,
    GBPCHF: 0,
    other: 0,
  },
  expired: {
    sum: 0,
    USDEUR: 0,
    USDCHF: 0,
    USDCNY: 0,
    GBPCHF: 0,
    other: 0,
  },
};

const initialState = {
  loading: "IDLE",
  entities: [],
  _entities: [],
  error: undefined,
  filters: {
    status: [],
  },
  sorting: {},
  totals: {
    ...initialTotals,
  },
  frozenCountLoading: true,
  pausedCountLoading: true,
};

export default function fxDocuProductList(state = initialState, action) {
  switch (action.type) {
    case FETCH_FX_DOCU:
      return {
        ...state,
        loading: "PENDING",
        frozenCountLoading: true,
        pausedCountLoading: true,
        totals: {
          ...initialTotals,
        },
        sorting: {}
      };
    case FETCH_FX_DOCU_SUCCESS:
      return {
        ...state,
        entities: normalize(action?.payload)?.reverse(),
        _entities: normalize(action?.payload)?.reverse(),
        loading: "LOADED",
      };
    case FETCH_FX_DOCU_ERROR:
      return {
        ...state,
        error: action?.error,
        loading: "NOT_LOADED",
      };
    case SET_FILTERS_FX_DOCU:
      return {
        ...state,
        filters: { ...action?.payload },
        entities: state._entities,
      };
    case SET_SORTING_FX_DOCU:
      return {
        ...state,
        sorting: { ...action?.payload },
        entities: applySorting(state._entities, {
          ...action?.payload,
        }),
      };
    case UPDATE_FX_DOCU_STATUS:
      return {
        ...state,
        _entities: updateStatus(action?.payload, state?._entities),
        entities: updateStatus(action?.payload, state?.entities),
      };
    case UPDATE_FX_DOCU_PAUSED_CONTRACTS:
      return {
        ...state,
        _entities: updatePausedContracts(state._entities, action?.payload),
        entities: updatePausedContracts(state.entities, action?.payload),
      };
    case RECALCULATE_TOTALS_FX_DOCU:
      return {
        ...state,
        totals: updateTotals([...state._entities]),
        pausedCountLoading: false,
        frozenCountLoading: false,
      };
    default:
      return state;
  }
}

/**
 * @param {Array<any>} entities
 * @param {{ [string]: string }} sorting
 * @returns {Array<any>}
 */
function applySorting(entities, sorting) {
  const result = Object.entries(sorting).flatMap(([key, value]) => {
    if (!value) return entities;
    const forSorting = [...entities];
    return applySortType(key, value, forSorting);
  });
  return result;
}

function applySortType(key, value, entities) {
  if (FIELD_TO_SORT_TYPE[key] === "NUM") {
    return value === "DESC"
      ? entities.sort((a, b) => b[key] - a[key])
      : entities.sort((a, b) => a[key] - b[key]);
  }

  if (FIELD_TO_SORT_TYPE[key] === "TEXT") {
    return value === "DESC"
      ? entities.sort((a, b) => a[key].localeCompare(b[key]))
      : entities.sort((a, b) => b[key].localeCompare(a[key]));
  }

  if (FIELD_TO_SORT_TYPE[key] === "DATE") {
    return value === "DESC"
      ? entities.sort((a, b) => new Date(b[key]) - new Date(a[key]))
      : entities.sort((a, b) => new Date(a[key]) - new Date(b[key]));
  }

  return entities;
}

function updateStatus({ tokenIds, status }, entities) {
  const updatedEntities = entities.map((entity) => {
    if (tokenIds.indexOf(entity.tokenId) > -1) {
      return {
        ...entity,
        status,
      };
    }
    return entity;
  });

  return updatedEntities;
}

function updatePausedContracts(entities, pausedContracts) {
  return [
    ...entities.map((entity) => {
      if (pausedContracts.includes(entity?.contractName)) {
        return {
          ...entity,
          contractPaused: true,
        };
      }
      return entity;
    }),
  ];
}

function updateTotals(entities) {
  console.log("updateTotals");
  return entities.reduce(
    (acc, { underlying, contractPaused, status }) => {
      if (contractPaused) {
        acc.paused.sum += 1;
        if (defaultHighlightedCurrencies.includes(underlying)) {
          acc.paused[underlying] += 1;
        } else if (
          defaultHighlightedCurrencies.includes(currencyPairAlias(underlying))
        ) {
          acc.paused[currencyPairAlias(underlying)] += 1;
        } else {
          acc.paused.other += 1;
        }
        return acc;
      }

      if (status === "Frozen") {
        acc.frozen.sum += 1;
        if (defaultHighlightedCurrencies.includes(underlying)) {
          acc.frozen[underlying] += 1;
        } else if (
          defaultHighlightedCurrencies.includes(currencyPairAlias(underlying))
        ) {
          acc.frozen[currencyPairAlias(underlying)] += 1;
        } else {
          acc.frozen.other += 1;
        }
        return acc;
      }

      acc.active.sum += 1;
      if (defaultHighlightedCurrencies.includes(underlying)) {
        acc.active[underlying] += 1;
      } else if (
        defaultHighlightedCurrencies.includes(currencyPairAlias(underlying))
      ) {
        acc.active[currencyPairAlias(underlying)] += 1;
      } else {
        acc.active.other += 1;
      }
      return acc;
    },
    {
      ...JSON.parse(JSON.stringify(initialTotals)),
    }
  );
}
