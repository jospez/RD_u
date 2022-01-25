import React from "react";
import { Row, Card, Col, Spinner } from "react-bootstrap";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getStatusIcon } from "./icon.utils.js";

const resetSpacingStyles = { margin: 0, padding: 0 };
const currencyPairStyles = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "nowrap",
  zIndex: 1,
};

const FxDocuCardsHeader = ({
  totals,
  pausedCountLoading,
  frozenCountLoading,
}) => {
  const { active, converted, paused, frozen, expired } = totals;
  return (
    <Row
      style={{
        display: "grid",
        gridAutoFlow: "column",
        columnGap: "1.25rem",
        marginTop: "1.25rem",
        marginLeft: "1.25rem",
        marginRight: "1.25rem",
      }}
    >
      {[
        { label: "Active", count: active },
        { label: "Converted", count: converted },
        { label: "Paused", count: paused },
        { label: "Frozen", count: frozen },
        { label: "Expired", count: expired },
      ].map(({ label, count }) => (
        <Card key={label} style={{ height: "11rem", flex: 1 }}>
          <Card.Body as={Row}>
            <Col
              lg={7}
              md={4}
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "column",
              }}
            >
              {getStatusIcon(label)}
              <Row
                style={{
                  ...resetSpacingStyles,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Card.Subtitle className="mb-2 text-muted">
                  {label}
                </Card.Subtitle>
                {label === "Paused" && pausedCountLoading && (
                  <Spinner animation="border" />
                )}
                {label === "Paused" && !pausedCountLoading && (
                  <h1 style={resetSpacingStyles} className="card-title">
                    {count?.sum}
                  </h1>
                )}
                {label === "Frozen" && frozenCountLoading && (
                  <Spinner animation="border" />
                )}
                {label === "Frozen" && !frozenCountLoading && (
                  <h1 style={resetSpacingStyles} className="card-title">
                    {count?.sum}
                  </h1>
                )}
                {label !== "Paused" && label !== "Frozen" && (
                  <h1 style={resetSpacingStyles} className="card-title">
                    {count?.sum ?? 0}
                  </h1>
                )}
              </Row>
            </Col>
            <Col
              lg={5}
              md={8}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Row
                style={{
                  ...resetSpacingStyles,
                  ...currencyPairStyles,
                }}
              >
                USDEUR <span>{count?.USDEUR}</span>
              </Row>
              <Row
                style={{
                  ...resetSpacingStyles,
                  ...currencyPairStyles,
                }}
              >
                USDCHF <span>{count?.USDCHF}</span>
              </Row>
              <Row
                style={{
                  ...resetSpacingStyles,
                  ...currencyPairStyles,
                }}
              >
                USDCNY <span>{count?.USDCNY}</span>
              </Row>
              <Row
                style={{
                  ...resetSpacingStyles,
                  ...currencyPairStyles,
                }}
              >
                GBPCHF <span>{count?.GBPCHF}</span>
              </Row>
              <Row
                className="text-muted"
                style={{
                  ...resetSpacingStyles,
                  ...currencyPairStyles,
                }}
              >
                Other <span>{count?.other}</span>
              </Row>
            </Col>
          </Card.Body>
        </Card>
      ))}
    </Row>
  );
};

function mapStateToProps(state) {
  return {
    totals: state.fxDocuProductList.totals,
    frozenCountLoading: state.fxDocuProductList.frozenCountLoading,
    pausedCountLoading: state.fxDocuProductList.pausedCountLoading,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators({}, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FxDocuCardsHeader);
