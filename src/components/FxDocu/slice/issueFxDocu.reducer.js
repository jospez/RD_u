import {
  FX_DOCU_ALLOW_TRANSFER_MODAL,
  FX_DOCU_CO_ISSUE,
  FX_DOCU_CO_ISSUE_ERROR,
  FX_DOCU_CO_ISSUE_REQUIRED,
  FX_DOCU_CO_ISSUE_SUCCESS,
  FX_DOCU_ISSUE,
  FX_DOCU_ISSUE_ERROR,
  FX_DOCU_ISSUE_RESET,
  FX_DOCU_ISSUE_SUCCESS,
} from "../../../redux/actionTypes";

const initialState = {
  issuanceStatus: "IDLE",
  coIssuanceStatus: "IDLE",
  error: "",
};

const issueFxDocu = (state = initialState, { type, payload, error }) => {
  switch (type) {
    case FX_DOCU_ISSUE:
      return {
        ...state,
        issuanceStatus: "PENDING",
        error: "",
      };
    case FX_DOCU_ISSUE_SUCCESS:
      return {
        ...state,
        issuanceStatus: "LOADED",
        error: "",
      };
    case FX_DOCU_ISSUE_ERROR:
      return {
        ...state,
        issuanceStatus: "NOT_LOADED",
        error,
      };
    case FX_DOCU_CO_ISSUE_REQUIRED:
      return {
        ...state,
        coIssuanceStatus: "REQUIRED",
      };
    case FX_DOCU_CO_ISSUE:
      return {
        ...state,
        coIssuanceStatus: "PENDING",
      };
    case FX_DOCU_CO_ISSUE_ERROR:
      return {
        ...state,
        coIssuanceStatus: "NOT_LOADED",
        error,
      };
    case FX_DOCU_CO_ISSUE_SUCCESS:
      return {
        ...state,
        coIssuanceStatus: "LOADED",
        error: "",
      };
    case FX_DOCU_ISSUE_RESET:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export default issueFxDocu;
