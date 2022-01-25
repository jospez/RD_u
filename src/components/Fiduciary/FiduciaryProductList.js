import React, { useEffect, useCallback } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import OptionsIcon from "@material-ui/icons/MoreVert";
import { toast, ToastContainer } from "react-toastify";
import {
  Container,
  Table,
  DropdownButton,
  Dropdown,
  Row,
  Form,
  Spinner,
} from "react-bootstrap";

import {
  fetchFiduciaryProductList,
  fetchFrozenFiduciaryDeposit,
  fetchPausedContractsFiduciaryDeposit,
  setFilter,
  expire,
  earlyExpire,
  setEarlyExpireVisibility,
  completeIssuance,
  freeze,
  unFreeze,
  pause,
  unPause,
} from "./slice/fiduciaryProductList.actions.js";
import { isToday, loadFiduciaryDeposit, thousandsSeparator } from "./utils.js";
import EarlyExpireModal from "./EarlyExpireModal.js";
import { getStatusIcon } from "../FxDocu/icon.utils.js";
import ContractBadge from "../FxDocu/ContractBadge.js";
import { isProd } from "../FxDocu/utils.js";

const FiduciaryProductList = ({ entities, filters, actions, loading }) => {
  useEffect(() => {
    loadFiduciaryDeposit(actions);
  }, []);

  const handleStatusFilter = (value) => {
    actions.setFilter({
      ...filters,
      status: filters?.status.includes(value)
        ? filters?.status.filter((v) => v !== value)
        : [...filters?.status, value],
    });
  };

  const noop = useCallback(() => {}, []);

  const handleExpire = (item) => () => {
    if (new Date(item?.maturityDate).getTime() > Date.now()) {
      toast.error(`You shall not 'Expire' deposits that are not yet mature!`);
      return;
    }
    actions.expire({ ...item, contractName: item.contractName });
  };

  const handleEarlyExpire = (item) => () => {
    actions.setEarlyExpireVisibility(true, { ...item, contractName: item.contractName });
  };

  const handleDetails = ({ tokenId, contractName }) => () => {
    window.open(
      `${window.location.origin}/fiduciaryDetails/${tokenId}/contract/${contractName}`,
      "_blank"
    );
  };

  const handleUnFreeze =
    ({ tokenId, contractName }) =>
    () => {
      actions.unFreeze(contractName, {
        priority: 3,
        tokenId,
      });
    };

  const handleFreeze =
    ({ tokenId, contractName }) =>
    () => {
      actions.freeze(contractName, {
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

  const handleCompleteIssuance = (item) => () => {
    actions.completeIssuance({ ...item, contractName: item.contractName });
  };

  const getStyles = (item) =>
    isToday(item.maturityDate) ? { backgroundColor: "rgb(243, 205, 156)" } : {};

  // todo optimize renders
  console.log(`FiduciaryDepositList - todo optimize number of renders`);

  return (
    <Container fluid>
      <Table style={{ marginTop: "1rem" }} striped bordered hover>
        <thead>
          <tr>
            <th>Identifier</th>
            <th>Product Type</th>
            <th>Currency</th>
            <th>Principal Amount</th>
            <th>Interest Amount</th>
            <th>Maturity Date</th>
            <th>
              <Row
                style={{
                  padding: "0",
                  margin: "0",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                Status
                <DropdownButton variant="secondary" title="" size="sm">
                  <Dropdown.Item
                    onSelect={(e) => handleStatusFilter(e)}
                    eventKey="Active"
                  >
                    <Row
                      style={{
                        padding: "0",
                        margin: "0",
                        alignItems: "center",
                      }}
                    >
                      <Form.Check
                        onChange={noop}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusFilter("Active");
                        }}
                        checked={filters.status.includes("Active")}
                      />
                      Active
                    </Row>
                  </Dropdown.Item>
                  <Dropdown.Item
                    onSelect={(e) => handleStatusFilter(e)}
                    eventKey="Frozen"
                  >
                    <Row
                      style={{
                        padding: "0",
                        margin: "0",
                        alignItems: "center",
                      }}
                    >
                      <Form.Check
                        onChange={noop}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusFilter("Frozen");
                        }}
                        checked={filters.status.includes("Frozen")}
                      />
                      Frozen
                    </Row>
                  </Dropdown.Item>
                </DropdownButton>
              </Row>
            </th>
          </tr>
        </thead>
        <tbody>
          {loading !== "PENDING" &&
            entities?.map((item, i) => (
              <tr
                style={getStyles(item, i)}
                key={`${item?.identifier}-${Math.random()}`}
              >
                <td>{item?.identifier}</td>
                <td>
                  {item?.productType}
                  {!isProd() && (
                    <ContractBadge contractName={item.contractName} />
                  )}
                </td>
                <td>{item?.currency}</td>
                <td>
                  {item?.principalAmount &&
                    thousandsSeparator(item.principalAmount)}
                </td>
                <td>
                  {item?.interestAmount &&
                    thousandsSeparator(item?.interestAmount)}
                </td>
                <td>{item?.maturityDate}</td>
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
                    <Dropdown style={{ padding: "4px 0" }} className="dropdown">
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
                        <Dropdown.Divider />
                        <Dropdown.Item onSelect={handleDetails(item)}>
                          Details
                        </Dropdown.Item>
                        {item?.status !== "EXPIRED" && (
                          <Dropdown.Item onSelect={handleExpire(item)}>
                            Expire
                          </Dropdown.Item>
                        )}
                        {item?.status !== "EXPIRED" && (
                          <Dropdown.Item onSelect={handleEarlyExpire(item)}>
                            Early Expire
                          </Dropdown.Item>
                        )}
                        {item?.status === "PENDING" && (
                          <Dropdown.Item
                            onSelect={handleCompleteIssuance(item)}
                          >
                            Complete Issuance
                          </Dropdown.Item>
                        )}
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
      <ToastContainer />
      <EarlyExpireModal />
    </Container>
  );
};

function mapStateToProps(state) {
  return {
    loading: state.fiduciaryProductList.loading,
    entities: state.fiduciaryProductList.entities,
    filters: state.fiduciaryProductList.filters,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators(
      {
        fetchFiduciaryProductList,
        fetchFrozenFiduciaryDeposit,
        fetchPausedContractsFiduciaryDeposit,
        setFilter,
        expire,
        earlyExpire,
        setEarlyExpireVisibility,
        completeIssuance,
        freeze,
        unFreeze,
        pause,
        unPause,
      },
      dispatch
    ),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FiduciaryProductList);
