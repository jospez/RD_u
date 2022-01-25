import React, { useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { ToastContainer } from "react-toastify";
import OptionsIcon from "@material-ui/icons/MoreVert";
import {
  Container,
  Table,
  Dropdown,
  Row,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLongArrowAltDown,
  faLongArrowAltUp,
} from "@fortawesome/free-solid-svg-icons";

import {
  fetchFxDocuProductList,
  fetchFrozenFxDocu,
  fetchPausedContractsFxDocu,
  recalculateTotals,
  setSorting,
  freeze,
  unFreeze,
  pause,
  unPause,
  seize,
} from "./slice/fxDocuProductList.actions.js";
import {
  allowTransferModal,
  expireModal,
  detailsModal,
  jsonDetailsModal,
} from "./slice/fxDocuModals.actions.js";
import { getStatusIcon } from "./icon.utils.js";
import { formatTimeRemaining, isProd, loadFxDocu } from "./utils.js";

import AllowTransferModal from "./modals/AllowTransferModal.js";
import ExpireModal from "./modals/ExpireModal.js";
import DetailsModal from "./modals/DetailsModal.js";
import JSONDetailsModal from "./modals/JSONDetailsModal.js";
import { thousandsSeparator } from "../Fiduciary/utils.js";
import ContractBadge from "./ContractBadge.js";

const FxDocuProductList = ({ actions, entities, loading, sorting }) => {
  useEffect(() => {
    loadFxDocu(actions);
  }, []);

  const handleDetails = (item) => () => {
    window.open(
      `${window.location.origin}/fxDocuDetails/${item?.tokenId}/contract/${item?.contractName}`,
      "_blank"
    );
  };

  const handleUnFreeze =
    ({ tokenId, contractName }) =>
    () => {
      actions.unFreeze(contractName ? contractName : "USDCNY", {
        priority: 3,
        tokenId,
      });
    };

  const handleFreeze =
    ({ tokenId, contractName }) =>
    () => {
      actions.freeze(contractName ? contractName : "USDCNY", {
        priority: 3,
        tokenId,
      });
    };

  const handlePause =
    ({ contractName }) =>
    () => {
      actions.pause(contractName, {
        priority: 3,
      });
    };

  const handleUnPause =
    ({ contractName }) =>
    () => {
      actions.unPause(contractName, {
        priority: 3,
      });
    };

  const handleSeize =
    ({ tokenId, contractName }) =>
    () => {
      actions.seize(contractName, {
        priority: 3,
        tokenId,
      });
    };

  const handleSorting = (field) => () => {
    actions.setSorting(field, sorting);
  };

  return (
    <Container fluid>
      <Table style={{ marginTop: "1rem" }} striped bordered hover>
        <thead>
          <tr>
            {Object.entries({
              isin: "Identifier",
              productType: "Product Type",
              investmentCurrency: "Investment Currency",
              underlying: "Underlying",
              strike: "Strike",
              notional: "Notional",
              expiry: "Expiry Date",
              status: "Status",
            }).map(([key, label]) => (
              <th
                key={key}
                style={{
                  cursor: "pointer",
                  fontWeight: !!sorting[key] ? "bold" : "normal",
                }}
                onClick={handleSorting(key)}
              >
                {label}{" "}
                {!!sorting[key] && (
                  <FontAwesomeIcon
                    style={{ marginLeft: ".5rem" }}
                    icon={
                      sorting[key] === "DESC"
                        ? faLongArrowAltDown
                        : faLongArrowAltUp
                    }
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading !== "PENDING" &&
            entities?.map((item) => (
              <tr key={`${item?.tokenId ?? Math.random()}`}>
                <td>{item?.isin}</td>
                <td>
                  {item?.productType}
                  {!isProd() && (
                    <ContractBadge contractName={item.contractName} />
                  )}
                </td>
                <td>{item?.investmentCurrency}</td>
                <td>{item?.underlying}</td>
                <td>{`${item?.strike}`}</td>
                {/* Below is to check for wrongly handled big numbers */}
                <td>{`${
                  item?.notional?.toString()?.includes("e")
                    ? item?.notional
                    : thousandsSeparator(item?.notional)
                }`}</td>
                <td>
                  {item?.expiry ? formatTimeRemaining(item?.expiry) : "n/a"}
                </td>
                <td>
                  <Row
                    className="options"
                    style={{
                      margin: "0",
                      padding: "0",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Row
                      style={{
                        margin: 0,
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {item?.contractPaused
                        ? getStatusIcon("Paused")
                        : getStatusIcon(item?.status)}
                      <span style={{ margin: "0 1rem" }}>{item?.status}</span>
                    </Row>
                    <Dropdown
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "4px 0",
                      }}
                      className="dropdown"
                    >
                      <Dropdown.Toggle as={OptionsIcon}>
                        Dropdown Button
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {item?.status === "Frozen" ? (
                          <Dropdown.Item onSelect={handleUnFreeze(item)}>
                            UnFreeze
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item onSelect={handleFreeze(item)}>
                            Freeze
                          </Dropdown.Item>
                        )}
                        <Dropdown.Item onSelect={handleSeize(item)}>
                          Seize
                        </Dropdown.Item>
                        <Dropdown.Item
                          onSelect={() =>
                            actions.allowTransferModal(true, item)
                          }
                        >
                          Allow Transfer
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        {item?.contractPaused ? (
                          <Dropdown.Item onSelect={handleUnPause(item)}>
                            UnPause ({item?.contractName})
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item onSelect={handlePause(item)}>
                            Pause ({item?.contractName})
                          </Dropdown.Item>
                        )}
                        <Dropdown.Item
                          onSelect={() => actions.expireModal(true, item)}
                        >
                          Expire ({item?.contractName})
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item
                          onSelect={() => actions.detailsModal(true, item)}
                        >
                          Transaction Details
                        </Dropdown.Item>
                        <Dropdown.Item onSelect={handleDetails(item)}>
                          Details (new tab)
                        </Dropdown.Item>
                        <Dropdown.Item
                          onSelect={() => actions.jsonDetailsModal(true, item)}
                        >
                          Download JSON
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </Row>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      {loading === "PENDING" && (
        <Row style={{ justifyContent: "center", alignItems: "center" }}>
          <Spinner animation="border" />
        </Row>
      )}
      {loading === "NOT_LOADED" && (
        <Row style={{ justifyContent: "center", alignItems: "center" }}>
          <Alert variant="danger">Error during loading. Try again later.</Alert>
        </Row>
      )}
      <DetailsModal />
      <ExpireModal />
      <AllowTransferModal />
      <JSONDetailsModal />
      <ToastContainer />
    </Container>
  );
};

function mapStateToProps(state) {
  return {
    loading: state.fxDocuProductList.loading,
    entities: state.fxDocuProductList.entities,
    filters: state.fxDocuProductList.filters,
    sorting: state.fxDocuProductList.sorting,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators(
      {
        fetchFxDocuProductList,
        fetchFrozenFxDocu,
        fetchPausedContractsFxDocu,
        recalculateTotals,
        setSorting,
        freeze,
        pause,
        seize,
        unFreeze,
        unPause,
        detailsModal,
        jsonDetailsModal,
        allowTransferModal,
        expireModal,
      },
      dispatch
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FxDocuProductList);
