import React from "react";
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import Row from "react-bootstrap/Row";

import TokenVault from "./components/TokenVault";
import FiduciaryDetails from "./components/Fiduciary/FiduciaryDetails";
import FxDocuDetails from "./components/FxDocu/FxDocuDetails";
import LoginPage from "./components/Auth/LoginPage";

import { useToken } from "./components/Auth/hooks";
import { isPublicRoute } from "./components/Auth/utils";

import "./styles.css";

const UMApp = () => {
  const { token, clear } = useToken();

  const location = window.location.hostname.split(".")[0] ?? "localhost";

  if (!token && !isPublicRoute()) {
    return <LoginPage />;
  }

  switch (location) {
    case "um-dev-digital-asset-vault":
      return (
        <Router>
          <link
            rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css"
            crossOrigin="anonymous"
          />
          <Route
            path="/fxDocuDetails/:tokenId/contract/:contract"
            component={FxDocuDetails}
          />
          <Route
            path="/fiduciaryDetails/:tokenId/contract/:contract"
            component={FiduciaryDetails}
          />
          <Route exact path="/" component={TokenVault} />
        </Router>
      );
    case "um-prod-digital-asset-vault":
      return (
        <Router>
          <link
            rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css"
            crossOrigin="anonymous"
          />
          <Route
            path="/fxDocuDetails/:tokenId/contract/:contract"
            component={FxDocuDetails}
          />
          <Route
            path="/fiduciaryDetails/:tokenId/contract/:contract"
            component={FiduciaryDetails}
          />
          <Route exact path="/" component={TokenVault} />
        </Router>
      );
    default:
      // demo mode or localhost
      return (
        <Router>
          <link
            rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css"
            crossOrigin="anonymous"
          />
          <Row id="navbar">
            &nbsp;|&nbsp;
            <Link to="/Client/uMoney/Digital-Asset-Vault">
              Client @ uMoney Digital Asset Vault
            </Link>
            &nbsp;|&nbsp;
            <Link to="/fiduciaryDetails">Fiduciary Deposit Termsheet</Link>
            &nbsp;|&nbsp;
            <Link to="/fxDocuDetails">Fx Docu Termsheet</Link>
            &nbsp;|&nbsp;
            <Link to="/" onClick={() => clear()}>
              Logout
            </Link>
            &nbsp;|&nbsp;
          </Row>
          <Route
            exact
            path="/Client/uMoney/Digital-Asset-Vault"
            component={TokenVault}
          />
          <Route
            path="/fxDocuDetails/:tokenId/contract/:contract"
            component={FxDocuDetails}
          />
          <Route
            path="/fiduciaryDetails/:tokenId/contract/:contract"
            component={FiduciaryDetails}
          />
        </Router>
      );
  }
};

export default UMApp;
