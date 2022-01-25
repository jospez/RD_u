import {
  HIDE_FIDUCIARY_CREATION_MODAL,
  ISSUE_FIDUCIARY_ERROR,
  ISSUE_FIDUCIARY,
  ISSUE_FIDUCIARY_SUCCESS,
  SHOW_FIDUCIARY_CREATION_MODAL,
  CO_ISSUE_FIDUCIARY_NEEDED,
  COMPLETE_ISSUNACE_FIDUCIARY_SUCCESS,
  COMPLETE_ISSUNACE_FIDUCIARY_ERROR,
  COMPLETE_ISSUNACE_FIDUCIARY,
  SET_COMPLETE_ISSUNACE_FIDUCIARY_LOCK,
} from "../../../redux/actionTypes.js";

const initialState = {
  isVisible: false,
  issuanceStatus: "IDLE",
  coIssuanceStatus: "IDLE",
  coIssuanceNeeded: false,
  coIssuanceLock: false,
  error: undefined,
};

export default function issueFiduciaryDeposit(state = initialState, action) {
  switch (action.type) {
    case SHOW_FIDUCIARY_CREATION_MODAL:
      return {
        ...state,
        isVisible: true,
      };
    case HIDE_FIDUCIARY_CREATION_MODAL:
      return {
        ...initialState,
        isVisible: false,
      };
    case ISSUE_FIDUCIARY:
      return {
        ...state,
        issuanceStatus: "PENDING",
      };
    case ISSUE_FIDUCIARY_SUCCESS:
      return {
        ...state,
        error: undefined,
        issuanceStatus: "LOADED",
      };
    case ISSUE_FIDUCIARY_ERROR:
      return {
        ...state,
        error: action.error,
        issuanceStatus: "NOT_LOADED",
      };
    case CO_ISSUE_FIDUCIARY_NEEDED:
      return {
        ...state,
        coIssuanceNeeded: action?.payload,
      };
    case SET_COMPLETE_ISSUNACE_FIDUCIARY_LOCK:
      return {
        ...state,
        coIssuanceLock: action?.payload,
      };
    case COMPLETE_ISSUNACE_FIDUCIARY:
      return {
        ...state,
        coIssuanceStatus: "PENDING",
      };
    case COMPLETE_ISSUNACE_FIDUCIARY_SUCCESS:
      return {
        ...state,
        error: undefined,
        coIssuanceStatus: "LOADED",
      };
    case COMPLETE_ISSUNACE_FIDUCIARY_ERROR:
      return {
        ...state,
        error: action.error,
        coIssuanceStatus: "NOT_LOADED",
      };
    default:
      return state;
  }
}
