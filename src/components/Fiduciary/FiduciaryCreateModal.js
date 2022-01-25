import React, { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  Alert,
  Button,
  Col,
  Dropdown,
  Form,
  InputGroup,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSquare,
  faTrashAlt,
} from "@fortawesome/free-regular-svg-icons";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

import {
  issueFiduciaryDeposit,
  hideFiduciaryCreationModal,
} from "./slice/issueFiduciaryDeposit.actions";
import { completeIssuance } from "./slice/fiduciaryProductList.actions.js";
import {
  addCommas,
  getEtherscanLinkForContract,
  getHash,
  removeNonNumeric,
  setDateFiledValue,
} from "./utils.js";
import { useFiduciaryContract } from "./hooks.js";
import {
  validateAddressLength,
  validateAddressStart,
} from "./formValidator.utils";
import NetworkPriority from "./NetworkPriority";
import ContractBadge from "../FxDocu/ContractBadge";

const FiduciaryCreationModal = ({
  isVisible,
  issuanceStatus,
  coIssuanceStatus,
  error,
  coIssuanceNeeded,
  coIssuanceLock,
  actions,
}) => {
  const { contractName } = useFiduciaryContract();

  const [warnings, setWarnings] = useState({});
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
    getValues,
  } = useForm({
    defaultValues: {
      priority: 1,
      lcrType: "NP",
      principalAmount: "",
      interestAmount: "",
      interestRate: "",
      hashOfRA: "",
      hashOfRABase64: "",
    },
  });

  const currencyPrincipalAmountSub = useWatch({
    control,
    name: "currencyPrincipalAmount",
  });

  const principalAmountSub = useWatch({ control, name: "principalAmount" });
  const interestAmountSub = useWatch({ control, name: "interestAmount" });
  const numberOfDaysSub = useWatch({ control, name: "numberOfDays" });
  const dayCountBasisSub = useWatch({ control, name: "dayCountBasis" });
  const interestRateSub = useWatch({ control, name: "interestRate" });
  const hashOfRASub = useWatch({ control, name: "hashOfRA" });

  const [interestAmountLocked, setInterestAmountLocked] = useState(true);

  const handleDeleteHash = () => {
    setValue("hashOfRA", "");
    setValue("hashOfRABase64", "");
  };

  const handleFile = async (e) => {
    for (const file of e?.target?.files) {
      const hashObject = await getHash(new Blob([file]));
      setValue("hashOfRA", hashObject.hex);
      setValue("hashOfRABase64", hashObject.base64);
    }
  };

  useEffect(() => {
    setValue("currencyInterestAmount", currencyPrincipalAmountSub);
  }, [currencyPrincipalAmountSub, setValue]);

  useEffect(() => {
    if (
      interestAmountLocked &&
      !!principalAmountSub &&
      !!interestRateSub &&
      !!numberOfDaysSub &&
      !!dayCountBasisSub
    ) {
      setValue(
        "interestAmount",
        (principalAmountSub * interestRateSub * numberOfDaysSub) /
          dayCountBasisSub
      );
    }

    if (
      !!interestRateSub &&
      !!principalAmountSub &&
      !!interestRateSub &&
      !!numberOfDaysSub &&
      !!dayCountBasisSub
    ) {
      const check =
        interestAmountSub ===
        (principalAmountSub * interestRateSub * numberOfDaysSub) /
          dayCountBasisSub;

      if (check) {
        setWarnings((prev) => ({ ...prev, interestAmount: undefined }));
      } else {
        setWarnings((prev) => ({
          ...prev,
          interestAmount: {
            type: "formulaCalc",
          },
        }));
      }
    }
  }, [
    principalAmountSub,
    interestAmountSub,
    numberOfDaysSub,
    dayCountBasisSub,
    interestRateSub,
    interestAmountLocked,
    setValue,
  ]);

  const closeView = () => {
    actions.hideFiduciaryCreationModal();
    reset();
  };

  const handleInterestAmountLock = () => {
    setInterestAmountLocked((prev) => !prev);
  };

  const openContractOnEtherscan = () => {
    window.open(getEtherscanLinkForContract(contractName), "_blank");
  };

  /**
   * @param {FiduciaryDepositForm} data
   */
  const onSubmit = (data) => {
    console.log("FiduciaryCreationModal submit", data);
    actions.issueFiduciaryDeposit(contractName, data);
  };

  const handleCompleteIssuance = () => {
    const data = getValues();
    actions.completeIssuance(contractName, data);
  };

  const commonProps = {
    readOnly:
      issuanceStatus === "PENDING" ||
      issuanceStatus === "LOADED" ||
      coIssuanceStatus === "PENDING" ||
      coIssuanceStatus === "LOADED",
    required: true,
  };

  return (
    <Modal
      size="lg"
      style={{ width: "800px", left: "calc(50% - 400px)" }}
      show={isVisible}
      onHide={closeView}
      backdrop={"static"}
      centered
    >
      <Modal.Header closeButton>
        <h1>Fiduciary Deposit</h1>
        <h5>
          <ContractBadge contractName={contractName} />
        </h5>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Trade Date
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...commonProps}
                {...register("tradeDate", { setValueAs: setDateFiledValue })}
                type="date"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Starting Date
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...commonProps}
                {...register("valueDate", {
                  setValueAs: setDateFiledValue,
                  validate: {
                    isAtOrAfterTradeDate: () =>
                      new Date(getValues("tradeDate")).getTime() <=
                      new Date(getValues("valueDate")).getTime(),
                  },
                })}
                type="date"
              />
              {errors?.valueDate?.type === "isAtOrAfterTradeDate" && (
                <Form.Text className="text-danger">
                  Starting Date has to be AT or AFTER Trade Date
                </Form.Text>
              )}
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Maturity Date
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...commonProps}
                {...register("maturityDate", {
                  setValueAs: setDateFiledValue,
                  validate: {
                    isAfterValueDate: () =>
                      new Date(getValues("valueDate")).getTime() <
                      new Date(getValues("maturityDate")).getTime(),
                  },
                })}
                type="date"
              />
              {errors?.maturityDate?.type === "isAfterValueDate" && (
                <Form.Text className="text-danger">
                  Maturity Date has to be AFTER Starting Date
                </Form.Text>
              )}
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Currency and Principal Amount
            </Form.Label>
            <Col sm={2}>
              <Form.Control
                {...commonProps}
                {...register("currencyPrincipalAmount")}
                placeholder="e.g. USD"
                type="text"
              />
            </Col>
            <Col sm={6}>
              <Controller
                control={control}
                name="principalAmount"
                render={({ field: { value, name } }) => {
                  return (
                    <Form.Control
                      value={addCommas(value)}
                      onChange={(e) =>
                        setValue(name, removeNonNumeric(e.target.value))
                      }
                      {...commonProps}
                      type="text"
                    />
                  );
                }}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Currency and Interest Amount
            </Form.Label>
            <Col sm={2}>
              <Form.Control
                {...commonProps}
                readOnly={true}
                {...register("currencyInterestAmount")}
                type="text"
              />
            </Col>
            <Col sm={6}>
              <InputGroup>
                <Controller
                  control={control}
                  name="interestAmount"
                  render={({ field: { value, name } }) => (
                    <Form.Control
                      value={addCommas(value)}
                      onChange={(e) =>
                        setValue(name, removeNonNumeric(e.target.value))
                      }
                      {...commonProps}
                      readOnly={interestAmountLocked}
                      type="text"
                    />
                  )}
                />
                <Button onClick={handleInterestAmountLock} variant="light">
                  <FontAwesomeIcon
                    icon={interestAmountLocked ? faEdit : faSquare}
                  />
                </Button>
              </InputGroup>
              {warnings?.interestAmount?.type === "formulaCalc" && (
                <Form.Text className="text-warning">
                  Interest Amount can be incorrect
                </Form.Text>
              )}
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Interest Rate
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...commonProps}
                {...register("interestRate", {
                  setValueAs: (v) => (!!v ? parseFloat(v) : ""),
                })}
                type="text"
              />
              <Form.Text
                style={{ paddingRight: ".25rem" }}
                className="text-muted"
              >
                (e.g. enter 5.1234% as 0.051234)
              </Form.Text>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Day count convention
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...commonProps}
                {...register("dayCountConvention")}
                type="text"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Number of days <strong>/</strong> Day count basis
            </Form.Label>
            <Col sm={2}>
              <Form.Control
                placeholder="e.g. 30"
                {...commonProps}
                {...register("numberOfDays", { valueAsNumber: true })}
                type="number"
              />
            </Col>
            <Col style={{ padding: "0" }}>
              <h3 style={{ textAlign: "center", margin: "0" }}>/</h3>
            </Col>
            <Col sm={5}>
              <Form.Control
                placeholder="e.g. 360"
                {...commonProps}
                {...register("dayCountBasis", { valueAsNumber: true })}
                type="number"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Business days
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...commonProps}
                {...register("businessDays")}
                type="text"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Business days convention
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...commonProps}
                {...register("businessDaysConvention")}
                type="text"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Bank Client LCR Type
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...commonProps}
                {...register("lcrType")}
                as="select"
                aria-label="Select LCR Type"
              >
                <option value="NP">NP</option>
                <option value="WS">WS</option>
                <option value="WSF">WSF</option>
              </Form.Control>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Hash of the Registration Agreement
            </Form.Label>
            <Col sm={8}>
              {hashOfRASub ? (
                <Row style={{ margin: 0, flexWrap: "nowrap" }}>
                  <Form.Control
                    {...commonProps}
                    readOnly={true}
                    {...register("hashOfRA")}
                    type="text"
                    aceholder="0x7f..."
                  />
                  <Button onClick={handleDeleteHash} variant="light">
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </Button>
                </Row>
              ) : (
                <Form.Control
                  {...commonProps}
                  {...register("hashOfRAFile")}
                  onChange={handleFile}
                  type="file"
                />
              )}
            </Col>
          </Form.Group>

          <Dropdown.Divider></Dropdown.Divider>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Fiduciary Account
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...commonProps}
                {...register("clientAccount", {
                  validate: {
                    length: validateAddressLength,
                    start: validateAddressStart,
                  },
                })}
                type="text"
                placeholder="0x7f..."
              />
              {errors?.clientAccount?.type === "length" && (
                <Form.Text className="text-danger">
                  Address has wrong length.
                </Form.Text>
              )}
              {errors?.clientAccount?.type === "start" && (
                <Form.Text className="text-danger">
                  Address should start with '0x'.
                </Form.Text>
              )}
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Deposit Taker
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...commonProps}
                {...register("coIssuer", {
                  validate: {
                    length: validateAddressLength,
                    start: validateAddressStart,
                  },
                })}
                type="text"
                placeholder="0x7f..."
              />
              {errors?.coIssuer?.type === "length" && (
                <Form.Text className="text-danger">
                  Address has wrong length.
                </Form.Text>
              )}
              {errors?.coIssuer?.type === "start" && (
                <Form.Text className="text-danger">
                  Address should start with '0x'.
                </Form.Text>
              )}
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Administrator
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...commonProps}
                {...register("administrator", {
                  validate: {
                    length: validateAddressLength,
                    start: validateAddressStart,
                  },
                })}
                type="text"
                placeholder="0x7f..."
              />
            </Col>
            {errors?.administrator?.type === "length" && (
              <Form.Text className="text-danger">
                Address has wrong length.
              </Form.Text>
            )}
            {errors?.administrator?.type === "start" && (
              <Form.Text className="text-danger">
                Address should start with '0x'.
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Identifier
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                {...commonProps}
                {...register("identifier")}
                type="text"
                placeholder="ISIN"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={4}>
              Network Priority
            </Form.Label>
            <Col sm={8}>
              <Controller
                control={control}
                name="priority"
                render={({ field: { onChange, name, value } }) => (
                  <NetworkPriority
                    name={name}
                    value={value}
                    onChange={onChange}
                  />
                )}
              ></Controller>
            </Col>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Form.Group>
            {issuanceStatus === "LOADED" && coIssuanceStatus === "LOADED" && (
              <Alert
                style={{
                  display: "inline-flex",
                  marginRight: ".5rem",
                  marginBottom: "0",
                }}
                variant="success"
              >
                You can safely close the form.
              </Alert>
            )}
            {(issuanceStatus === "NOT_LOADED" ||
              coIssuanceStatus === "NOT_LOADED") && (
              <Alert
                style={{
                  display: "inline-flex",
                  marginRight: ".5rem",
                  marginBottom: "0",
                }}
                variant="danger"
              >
                {error?.message || "Unexpected error occuered."}
              </Alert>
            )}
            {issuanceStatus === "IDLE" && <Button type="submit">Send</Button>}
            {issuanceStatus === "LOADED" && (
              <Button variant="success" disabled>
                Issuance Successful
              </Button>
            )}
            {issuanceStatus === "LOADED" &&
              coIssuanceNeeded &&
              coIssuanceStatus === "IDLE" && (
                <Button
                  style={{ marginLeft: ".5rem" }}
                  type="submit"
                  variant="primary"
                  disabled={coIssuanceLock}
                  onClick={handleCompleteIssuance}
                >
                  Complete Issuance
                </Button>
              )}
            {issuanceStatus === "LOADED" &&
              coIssuanceNeeded &&
              coIssuanceStatus === "NOT_LOADED" && (
                <Button
                  style={{ marginLeft: ".5rem" }}
                  variant="warning"
                  type="submit"
                  disabled={coIssuanceLock}
                  onClick={handleCompleteIssuance}
                >
                  Try Again (Co Issue)
                </Button>
              )}
            {coIssuanceStatus === "LOADED" && (
              <>
                <Button
                  style={{
                    marginLeft: ".5rem",
                  }}
                  variant="success"
                  disabled
                >
                  Co-Issuance Successful
                </Button>
              </>
            )}
            {issuanceStatus === "NOT_LOADED" && (
              <>
                <Button variant="danger" type="submit">
                  Try again
                </Button>
              </>
            )}
            {(issuanceStatus === "PENDING" ||
              coIssuanceStatus === "PENDING") && (
              <Button
                style={{
                  marginLeft: ".5rem",
                }}
                type="submit"
                disabled
              >
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              </Button>
            )}
            {issuanceStatus === "LOADED" && (
              <Button
                style={{
                  marginLeft: ".5rem",
                }}
                onClick={openContractOnEtherscan}
                variant="light"
              >
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            )}
          </Form.Group>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

function mapStateToProps(state) {
  return {
    isVisible: state.issueFiduciaryDeposit.isVisible,
    issuanceStatus: state.issueFiduciaryDeposit.issuanceStatus,
    coIssuanceNeeded: state.issueFiduciaryDeposit.coIssuanceNeeded,
    coIssuanceStatus: state.issueFiduciaryDeposit.coIssuanceStatus,
    coIssuanceLock: state.issueFiduciaryDeposit.coIssuanceLock,
    error: state.issueFiduciaryDeposit.error,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators(
      {
        hideFiduciaryCreationModal,
        issueFiduciaryDeposit,
        completeIssuance,
      },
      dispatch
    ),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FiduciaryCreationModal);

/**
 * @typedef {('NP'|'WS'|'WSF')} BankLCRType
 *
 * @typedef {{
 *    hashOfRA: string,
 *    hashOfRABase64: string,
 *    tradeDate: string, // ISO string e.g. "2021-08-28T00:00:00.000Z"
 *    valueDate: string,
 *    maturityDate: string,
 *    currencyPrincipalAmount: string,
 *    principalAmount: number,
 *    currencyInterestAmount: string,
 *    interestAmount: number,
 *    interestRate: number,
 *    dayCountConvention: string,
 *    numberOfDays: number,
 *    dayCountBasis: number,
 *    lcrType: BankLCRType,
 *    clientAccount: string,
 *    coIssuer: string,
 *    administrator: string,
 *    identifier: string,
 *    priority: number,
 *    businessDays: string,
 *    businessDaysConvention: string,
 *  }} FiduciaryDepositForm
 */
