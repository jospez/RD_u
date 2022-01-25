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
} from "../../../redux/actionTypes";

const initialState = {
  transferModal: {
    isVisible: false,
    data: {},
    loading: "IDLE",
    error: "",
  },
  expireModal: {
    isVisible: false,
    data: {},
    loading: "IDLE",
    error: "",
  },
  detailsModal: {
    isVisible: false,
    data: {},
  },
  jsonDetailsModal: {
    isVisible: false,
    data: {},
  },
  createModal: {
    isVisible: false,
    data: {},
  },
};

const fxDocuModals = (state = initialState, { type, payload, error }) => {
  switch (type) {
    case FX_DOCU_ALLOW_TRANSFER_MODAL:
      return {
        ...state,
        transferModal: payload.isVisible
          ? {
              ...state.transferModal,
              isVisible: payload.isVisible ?? false,
              data: { ...payload?.data },
            }
          : { ...initialState.transferModal },
      };
    case FX_DOCU_TRANSFER:
      return {
        ...state,
        transferModal: {
          ...state.transferModal,
          loading: "PENDING",
        },
      };
    case FX_DOCU_TRANSFER_SUCCESS:
      return {
        ...state,
        transferModal: {
          ...state.transferModal,
          loading: "LOADED",
          error: "",
        },
      };
    case FX_DOCU_TRANSFER_ERROR:
      return {
        ...state,
        transferModal: {
          ...state.transferModal,
          loading: "NOT_LOADED",
          error,
        },
      };
    case FX_DOCU_EXPIRE_MODAL:
      return {
        ...state,
        expireModal: payload.isVisible
          ? {
              ...state.expireModal,
              isVisible: payload.isVisible ?? false,
              data: { ...payload?.data },
            }
          : { ...initialState.expireModal },
      };
    case FX_DOCU_EXPIRE:
      return {
        ...state,
        expireModal: {
          ...state.expireModal,
          loading: "PENDING",
        },
      };
    case FX_DOCU_EXPIRE_SUCCESS:
      return {
        ...state,
        expireModal: {
          ...state.expireModal,
          loading: "LOADED",
          error: "",
        },
      };
    case FX_DOCU_EXPIRE_ERROR:
      return {
        ...state,
        expireModal: {
          ...state.expireModal,
          loading: "NOT_LOADED",
          error,
        },
      };
    case FX_DOCU_DETAILS_MODAL:
      return {
        ...state,
        detailsModal: payload.isVisible
          ? {
              ...state.jsonDetailsModal,
              isVisible: payload.isVisible ?? false,
              data: { ...payload?.data },
            }
          : { ...initialState.jsonDetailsModal },
      };
    case FX_DOCU_JSON_DETAILS_MODAL:
      return {
        ...state,
        jsonDetailsModal: payload.isVisible
          ? {
              ...state.jsonDetailsModal,
              isVisible: payload.isVisible ?? false,
              data: { ...payload?.data },
            }
          : { ...initialState.jsonDetailsModal },
      };
    case FX_DOCU_CREATE_MODAL:
      return {
        ...state,
        createModal: payload.isVisible
          ? {
              ...state.createModal,
              isVisible: payload.isVisible ?? false,
              data: { ...payload?.data },
            }
          : { ...initialState.createModal },
      };
    default:
      return state;
  }
};

export default fxDocuModals;
