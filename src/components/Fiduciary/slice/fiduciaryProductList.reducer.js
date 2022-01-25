import {
  FETCH_FIDUCIARY_PRODUCTS,
  FETCH_FIDUCIARY_PRODUCTS_SUCCESS,
  FETCH_FIDUCIARY_PRODUCTS_ERROR,
  SET_FILTERS_FIDUCIARY_PRODUCTS,
  EXPIRE_FIDUCIARY_DEPOSIT_SUCCESS,
  EXPIRE_EARLY_FIDUCIARY_DEPOSIT_SUCCESS,
  SET_EXPIRE_EARLY_FD_MODAL_VISIBLE,
  UPDATE_FIDUCIARY_DEPOSIT_STATUS,
  UPDATE_FIDUCIARY_DEPOSIT_PAUSED_CONTRACTS,
} from "../../../redux/actionTypes";

const initialState = {
  loading: "IDLE",
  entities: [],
  _entities: [],
  error: undefined,
  filters: {
    status: ["Frozen", "Active"],
  },
  modals: {
    earlyExpire: {
      visible: false,
      data: {},
    },
  },
};

export default function fiduciaryProductList(state = initialState, action) {
  switch (action.type) {
    case FETCH_FIDUCIARY_PRODUCTS:
      return {
        ...state,
        loading: "PENDING",
      };
    case FETCH_FIDUCIARY_PRODUCTS_SUCCESS:
      return {
        ...state,
        entities: filterEntities(
          { ...state.filters, ...action?.payload },
          action?.payload
        ),
        _entities: action?.payload,
        loading: "LOADED",
      };
    case FETCH_FIDUCIARY_PRODUCTS_ERROR:
      return {
        ...state,
        error: action.error,
        loading: "NOT_LOADED",
      };
    case EXPIRE_FIDUCIARY_DEPOSIT_SUCCESS:
      return {
        ...state,
        entities: action?.payload
          ? filterByTokenId(action?.payload, state.entities)
          : state.entities,
        _entities: action?.payload
          ? filterByTokenId(action?.payload, state._entities)
          : state._entities,
      };
    case EXPIRE_EARLY_FIDUCIARY_DEPOSIT_SUCCESS:
      return {
        ...state,
        entities: action?.payload
          ? filterByTokenId(action?.payload, state.entities)
          : state.entities,
        _entities: action?.payload
          ? filterByTokenId(action?.payload, state._entities)
          : state._entities,
      };
    case SET_FILTERS_FIDUCIARY_PRODUCTS:
      return {
        ...state,
        filters: { ...action?.payload },
        entities: filterEntities(
          { ...state.filters, ...action?.payload },
          state._entities
        ),
      };
    case SET_EXPIRE_EARLY_FD_MODAL_VISIBLE:
      return {
        ...state,
        modals: {
          ...state.modals,
          earlyExpire: {
            visible: action.payload.visible,
            data: { ...action.payload.data },
          },
        },
      };
    case UPDATE_FIDUCIARY_DEPOSIT_STATUS:
      return {
        ...state,
        _entities: updateStatus(action?.payload, state?._entities),
        entities: updateStatus(action?.payload, state?.entities),
      };
    case UPDATE_FIDUCIARY_DEPOSIT_PAUSED_CONTRACTS:
      return {
        ...state,
        _entities: updatePausedContracts(state._entities, action?.payload),
        entities: updatePausedContracts(state.entities, action?.payload),
      };
    default:
      return state;
  }
}

function filterEntities(filters, entities) {
  const setFilters = Object.keys(filters);

  let result = [...entities];

  setFilters.forEach((filterField) => {
    const filterValue = filters[filterField];

    // assume array
    if (typeof filterValue === "object" && filterValue?.length > 0) {
      result = result.filter((item) => filterValue.includes(item[filterField]));
    } else if (typeof filterValue === "object" && filterValue?.length === 0) {
      result = entities;
    }
  });

  return result;
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

function filterByTokenId(_tokenId, entitles) {
  return entitles.filter(({ tokenId }) => tokenId !== _tokenId);
}
