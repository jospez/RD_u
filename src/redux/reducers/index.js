import { combineReducers } from "redux";

import tokenVaultTableContext from "./tokenVaultTableContext";
import issueFiduciaryDeposit from "../../components/Fiduciary/slice/issueFiduciaryDeposit.reducer.js";
import fiduciaryProductList from "../../components/Fiduciary/slice/fiduciaryProductList.reducer.js";
import fxDocuProductList from "../../components/FxDocu/slice/fxDocuProductList.reducer.js";
import fxDocuModals from "../../components/FxDocu/slice/fxDocuModals.reducer.js";
import issueFxDocu from "../../components/FxDocu/slice/issueFxDocu.reducer.js";

const rootReducer = combineReducers({
  tokenVaultTableContext,
  issueFiduciaryDeposit,
  fiduciaryProductList,
  fxDocuProductList,
  fxDocuModals,
  issueFxDocu,
});

export default rootReducer;
