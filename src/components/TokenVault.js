import React, { useEffect } from "react";
import "../styles.css";
import "react-toastify/dist/ReactToastify.css";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Row from "react-bootstrap/Row";
import FiduciaryProductList from "./Fiduciary/FiduciaryProductList";
import person from "./generic-person.jpg";
import AppsIcon from "@material-ui/icons/Apps";
import SearchIcon from "@material-ui/icons/Search";
import { Button, Container } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { tokenVaultTableContext } from "../redux/actions/tokenVaultTableContext";
import { showFiduciaryCreationModal } from "./Fiduciary/slice/issueFiduciaryDeposit.actions.js";
import FiduciaryCreationModal from "./Fiduciary/FiduciaryCreateModal";
import FxDocuCreateModal from "./FxDocu/modals/FxDocuCreateModal";
import { createModal as fxDocuCreateModal } from "./FxDocu/slice/fxDocuModals.actions.js";
import RefreshIcon from "@material-ui/icons/Refresh";
import { fetchFiduciaryProductList } from "./Fiduciary/slice/fiduciaryProductList.actions.js";
import FxDocu from "./FxDocu/FxDocu.js";
import {
  fetchFxDocuProductList,
  fetchFrozenFxDocu,
  fetchPausedContractsFxDocu,
  recalculateTotals,
} from "./FxDocu/slice/fxDocuProductList.actions.js";
import { useFiduciaryContract } from "./Fiduciary/hooks";
import { loadFxDocu } from "./FxDocu/utils";
import { useToken } from "../components/Auth/hooks";

const TokenVault = ({ tableContext, actions }) => {
  const { clear } = useToken();
  useEffect(() => {
    document.title = "Client at uMoney Permissions";
  }, []);

  // todo move
  const { contractName } = useFiduciaryContract();

  const handleRefresh = () => {
    if (tableContext === "FXDOCU") {
      loadFxDocu(actions);
    }

    if (tableContext === "FD") {
      actions.fetchFiduciaryProductList({ contractName });
    }
  };

  const handleTableContext = (context) => () => {
    actions.tokenVaultTableContext(context);
  };

  return (
    <Container fluid style={{ padding: 0 }}>
      <Row
        style={{
          margin: 0,
          padding: "1rem",
          background: "black",
          alignItems: "center",
          display: "flex",
        }}
      >
        <AppsIcon style={{ fill: "white" }} fontSize="large"></AppsIcon>
        <h2
          style={{
            margin: "0 1rem 0 2rem",
            fontSize: "1.5rem",
            color: "white",
          }}
        >
          uMoney
        </h2>
        <Row
          style={{
            margin: "0 2rem",
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
        >
          <SearchIcon
            style={{
              position: "absolute",
              left: 0,
              fill: "white",
              background: "#414141",
              border: 0,
              height: "2.5rem",
              width: "2.5rem",
              borderRadius: ".25rem",
              padding: ".25rem",
            }}
            fontSize="large"
          ></SearchIcon>
          <input
            type="text"
            style={{
              width: "300px",
              background: "#414141",
              border: 0,
              color: "white",
              height: "2.5rem",
              borderRadius: ".25rem",
              paddingLeft: "2.5rem",
            }}
          />
          <Button
            style={{
              padding: 0,
              height: "2.5rem",
              width: "2.5rem",
              background: "white",
              color: "black",
              border: "white",
              position: "absolute",
              right: 0,
            }}
            onClick={handleRefresh}
          >
            <RefreshIcon></RefreshIcon>
          </Button>
        </Row>
        <Form
          style={{
            padding: "0",
            margin: "0",
            color: "white",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Form.Check label="Fx Docu" style={{ marginRight: "1.5rem" }}>
            <Form.Check.Input
              onChange={handleTableContext("FXDOCU")}
              checked={tableContext === "FXDOCU"}
              type="radio"
              id="radio-1"
            />
            <Form.Check.Label
              onClick={handleTableContext("FXDOCU")}
              style={{
                marginLeft: ".5rem",
                fontSize: "1.25rem",
                cursor: "pointer",
              }}
            >{`Fx Docu`}</Form.Check.Label>
          </Form.Check>
          <Form.Check label="Fx Docu" style={{ marginRight: "1.5rem" }}>
            <Form.Check.Input
              onChange={handleTableContext("FD")}
              checked={tableContext === "FD"}
              type="radio"
              id="radio-2"
            />
            <Form.Check.Label
              onClick={handleTableContext("FD")}
              style={{
                marginLeft: ".5rem",
                fontSize: "1.25rem",
                cursor: "pointer",
              }}
            >{`Fiduciary Deposit`}</Form.Check.Label>
          </Form.Check>
        </Form>
        <Button
          align="right"
          text="FX DOCU"
          onClick={() => actions.fxDocuCreateModal(true)}
          style={{
            width: "90px",
            margin: "auto",
            marginRight: "12px",
            background: "white",
            color: "black",
            border: "white",
          }}
        >
          Fx Docu
        </Button>
        <Button
          align="right"
          text="Fiduciary"
          onClick={() => actions.showFiduciaryCreationModal()}
          style={{
            width: "120px",
            margin: "2px 12px",
            marginRight: "12px",
            background: "white",
            color: "black",
            border: "white",
          }}
        >
          Fiduciary Deposit
        </Button>
        <img
          onClick={() => clear()}
          src={person}
          alt="Person"
          style={{
            cursor: "pointer",
            marginLeft: "2.5rem",
            height: "2.5rem",
            width: "2.5rem",
            borderRadius: "50%",
          }}
        />
      </Row>
      {tableContext === "FXDOCU" && <FxDocu />}
      {tableContext === "FD" && <FiduciaryProductList />}
      <FxDocuCreateModal />
      <FiduciaryCreationModal />
    </Container>
  );
};

function mapStateToProps(state) {
  return {
    tableContext: state.tokenVaultTableContext.context,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators(
      {
        showFiduciaryCreationModal,
        tokenVaultTableContext,
        fetchFiduciaryProductList,
        fetchFxDocuProductList,
        fetchFrozenFxDocu,
        fetchPausedContractsFxDocu,
        recalculateTotals,
        fxDocuCreateModal,
      },
      dispatch
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TokenVault);
