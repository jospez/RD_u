import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { forwardRef, useImperativeHandle } from "react";
import {
  Alert,
  Button,
  Col,
  Dropdown,
  Form,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import { useForm, Controller, useWatch } from "react-hook-form";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  validateAddressLength,
  validateAddressStart,
} from "../../Fiduciary/formValidator.utils";
import NetworkPriority from "../../Fiduciary/NetworkPriority";
import { setDateFiledValue } from "../../Fiduciary/utils";
import { isValidInvestmentCurrency } from "../formValidator.utils";
import { useFxDocuContract } from "../hooks";
import {
  issueFxDocu,
  coIssueFxDocu,
  reset,
} from "../slice/issueFxDocu.actions";
import {
  getEtherscanLinkForContract,
} from "../utils";

export const FxDocuCreateFormModal = forwardRef(
  ({ setContext, actions, issuanceStatus, coIssuanceStatus, error }, ref) => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
      control,
      setValue,
    } = useForm({
      defaultValues: {
        priority: 1,
        baseCurrency: "",
        quoteCurrency: "",
        notional: "",
      },
    });

    useImperativeHandle(ref, () => ({
      resetForm() {
        console.log("reset form!!!");
        actions.reset();
        reset();
      },
    }));

    const { contractName } = useFxDocuContract();
    const baseCurrencySub = useWatch({ control, name: "baseCurrency" });
    const quoteCurrencySub = useWatch({ control, name: "quoteCurrency" });

    const onSubmit = (formData) => {
      console.log(formData);
      actions.issueFxDocu(contractName, formData);
    };

    const onCoIssueSubmit = (formData) => {
      console.log(formData);
      actions.coIssueFxDocu(contractName, formData);
    };

    const openContractOnEtherscan = () => {
      window.open(getEtherscanLinkForContract(contractName), "_blank");
    };

    const commonProps = {
      readOnly: issuanceStatus === "PENDING" || issuanceStatus === "LOADED",
      required: true,
    };

    return (
      <>
        <Modal.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group as={Row}>
              <Form.Label column sm={4}>
                Currency Pair
              </Form.Label>
              <Col style={{ display: "flex" }} sm={8}>
                <Row
                  style={{ padding: 0, margin: 0, display: "flex", flex: 1 }}
                >
                  <Form.Control
                    {...commonProps}
                    {...register("baseCurrency", {
                      maxLength: 3,
                      minLength: 3,
                      required: true,
                    })}
                    type="text"
                    placeholder="e.g. USD (base currency)"
                  />
                  {errors?.baseCurrency?.type === "minLength" && (
                    <Form.Text className="text-danger">
                      Currency has to have 3 characters.
                    </Form.Text>
                  )}
                  {errors?.baseCurrency?.type === "maxLength" && (
                    <Form.Text className="text-danger">
                      Currency has to have 3 characters.
                    </Form.Text>
                  )}
                  {errors?.baseCurrency?.type === "required" && (
                    <Form.Text className="text-danger">
                      This field is required.
                    </Form.Text>
                  )}
                </Row>
                <Row
                  style={{ padding: 0, margin: 0, display: "flex", flex: 1 }}
                >
                  <Form.Control
                    {...commonProps}
                    {...register("quoteCurrency", {
                      maxLength: 3,
                      minLength: 3,
                      required: true,
                    })}
                    type="text"
                    placeholder="e.g. PLN (quote currency)"
                  />
                  {errors?.quoteCurrency?.type === "minLength" && (
                    <Form.Text className="text-danger">
                      Currency has to have 3 characters.
                    </Form.Text>
                  )}
                  {errors?.quoteCurrency?.type === "maxLength" && (
                    <Form.Text className="text-danger">
                      Currency has to have 3 characters.
                    </Form.Text>
                  )}
                  {errors?.quoteCurrency?.type === "required" && (
                    <Form.Text className="text-danger">
                      This field is required.
                    </Form.Text>
                  )}
                </Row>
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Form.Label column sm={4}>
                Notional
              </Form.Label>
              <Col style={{ display: "flex" }} sm={8}>
                <Row
                  style={{ padding: 0, margin: 0, display: "flex", flex: 1 }}
                >
                  <Form.Control
                    {...commonProps}
                    required={true}
                    {...register("notional", { required: true })}
                    type="number"
                  />
                  {errors?.notional?.type === "required" && (
                    <Form.Text className="text-danger">
                      This field is required.
                    </Form.Text>
                  )}
                </Row>

                <Row
                  style={{ padding: 0, margin: 0, display: "flex", flex: 1 }}
                >
                  <Form.Control
                    {...commonProps}
                    {...register("investmentCurrency", {
                      validate: {
                        isCorrectCurrency: isValidInvestmentCurrency(
                          baseCurrencySub,
                          quoteCurrencySub
                        ),
                      },
                    })}
                    type="text"
                    placeholder="Investment Currency"
                  />
                  {errors?.investmentCurrency?.type === "isCorrectCurrency" && (
                    <Form.Text className="text-danger">
                      Should be either {baseCurrencySub || "base currency"} or{" "}
                      {quoteCurrencySub || "quote currency"}.
                    </Form.Text>
                  )}
                  {errors?.investmentCurrency?.type === "required" && (
                    <Form.Text className="text-danger">
                      This field is required.
                    </Form.Text>
                  )}
                </Row>
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Form.Label column sm={4}>
                Strike
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  {...commonProps}
                  {...register("strike", { required: true })}
                  type="number"
                />
                {errors?.strike?.type === "required" && (
                  <Form.Text className="text-danger">
                    This field is required.
                  </Form.Text>
                )}
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Form.Label column sm={4}>
                Trade date
              </Form.Label>
              <Col style={{ display: "flex" }} sm={8}>
                <Row
                  style={{ padding: 0, margin: 0, display: "flex", flex: 1 }}
                >
                  <Form.Control
                    {...commonProps}
                    {...register("tradeDate", {
                      setValueAs: setDateFiledValue,
                      required: true,
                    })}
                    type="date"
                  />
                  {errors?.tradeDate?.type === "required" && (
                    <Form.Text className="text-danger">
                      This field is required.
                    </Form.Text>
                  )}
                </Row>
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Form.Label column sm={4}>
                Value date
              </Form.Label>
              <Col style={{ display: "flex" }} sm={8}>
                <Row
                  style={{ padding: 0, margin: 0, display: "flex", flex: 1 }}
                >
                  <Form.Control
                    {...commonProps}
                    {...register("valueDate", {
                      setValueAs: setDateFiledValue,
                      required: true,
                    })}
                    type="date"
                  />
                  {errors?.valueDate?.type === "required" && (
                    <Form.Text className="text-danger">
                      This field is required.
                    </Form.Text>
                  )}
                </Row>
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Form.Label column sm={4}>
                Expiry date
              </Form.Label>
              <Col style={{ display: "flex" }} sm={8}>
                <Row
                  style={{ padding: 0, margin: 0, display: "flex", flex: 1 }}
                >
                  <Form.Control
                    {...commonProps}
                    {...register("expiryDate", {
                      setValueAs: setDateFiledValue,
                      required: true,
                    })}
                    type="date"
                  />
                  {errors?.expiryDate?.type === "required" && (
                    <Form.Text className="text-danger">
                      This field is required.
                    </Form.Text>
                  )}
                </Row>
                <Row
                  style={{ padding: 0, margin: 0, display: "flex", flex: 1 }}
                >
                  <Form.Control
                    {...commonProps}
                    {...register("expiryZone")}
                    as="select"
                  >
                    <option value={10}>10:00 New York</option>
                    <option value={15}>15:00 Tokyo</option>
                  </Form.Control>
                </Row>
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Form.Label column sm={4}>
                Coupon
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  {...commonProps}
                  {...register("coupon", { required: true })}
                  type="number"
                />
                <Form.Text
                  style={{ paddingRight: ".25rem" }}
                  className="text-muted"
                >
                  (e.g. enter 5.1234% as 0.051234)
                </Form.Text>
                {errors?.coupon?.type === "required" && (
                  <Form.Text className="text-danger">
                    This field is required.
                  </Form.Text>
                )}
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Form.Label column sm={4}>
                Converted amount
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  {...commonProps}
                  {...register("convertedAmount", { required: true })}
                  type="number"
                />
                {errors?.convertedAmount?.type === "required" && (
                  <Form.Text className="text-danger">
                    This field is required.
                  </Form.Text>
                )}
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Form.Label column sm={4}>
                Non-Converted amount
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  {...commonProps}
                  {...register("nonConvertedAmount", { required: true })}
                  type="number"
                />
                {errors?.nonConvertedAmount?.type === "required" && (
                  <Form.Text className="text-danger">
                    This field is required.
                  </Form.Text>
                )}
              </Col>
            </Form.Group>

            <Dropdown.Divider />

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={4}>
                Client Account
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  {...commonProps}
                  {...register("clientAccount", {
                    validate: {
                      length: validateAddressLength,
                      start: validateAddressStart,
                    },
                    required: true,
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
                {errors?.clientAccount?.type === "required" && (
                  <Form.Text className="text-danger">
                    This field is required.
                  </Form.Text>
                )}
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={4}>
                Co Issuer
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
                    required: true,
                  })}
                  type="text"
                  placeholder="0x7f..."
                />
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
                {errors?.administrator?.type === "required" && (
                  <Form.Text className="text-danger">
                    This field is required.
                  </Form.Text>
                )}
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Form.Label column sm={4}>
                Identifier
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  {...commonProps}
                  {...register("identifier", {
                    required: true,
                  })}
                  type="text"
                  placeholder="ISIN"
                />
                {errors?.identifier?.type === "required" && (
                  <Form.Text className="text-danger">
                    This field is required.
                  </Form.Text>
                )}
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

            <Form.Group as={Row}>
              <Form.Label column sm={4}>
                Comment
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  {...commonProps}
                  {...register("comment")}
                  type="text"
                />
              </Col>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
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
          {issuanceStatus === "LOADED" && coIssuanceStatus === "IDLE" && (
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

          {issuanceStatus === "IDLE" && (
            <Button onClick={handleSubmit(onSubmit)}>Submit Trade</Button>
          )}
          {issuanceStatus === "PENDING" && (
            <Button
              style={{
                marginLeft: ".5rem",
              }}
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
          {issuanceStatus === "NOT_LOADED" && (
            <Button onClick={handleSubmit(onSubmit)} variant="warning">
              Try again
            </Button>
          )}
          {issuanceStatus === "LOADED" && (
            <Button variant="success" disabled>
              Issuance Successful
            </Button>
          )}

          {issuanceStatus === "LOADED" && coIssuanceStatus === "REQUIRED" && (
            <Button onClick={handleSubmit(onCoIssueSubmit)}>
              Complete Issuance
            </Button>
          )}

          {issuanceStatus === "LOADED" && coIssuanceStatus === "PENDING" && (
            <Button
              style={{
                marginLeft: ".5rem",
              }}
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

          {issuanceStatus === "LOADED" && coIssuanceStatus === "NOT_LOADED" && (
            <Button onClick={handleSubmit(onCoIssueSubmit)} variant="warning">
              Try again (Co Issue)
            </Button>
          )}

          {issuanceStatus === "LOADED" && coIssuanceStatus === "LOADED" && (
            <Button variant="success" disabled>
              Co-Issuance Successful
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
        </Modal.Footer>
      </>
    );
  }
);

function mapStateToProps(state) {
  return {
    isVisible: state.fxDocuModals.createModal.isVisible,
    data: state.fxDocuModals.createModal.data,
    issuanceStatus: state.issueFxDocu.issuanceStatus,
    coIssuanceStatus: state.issueFxDocu.coIssuanceStatus,
    error: state.issueFxDocu.error,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators(
      {
        issueFxDocu,
        coIssueFxDocu,
        reset,
      },
      dispatch
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
})(FxDocuCreateFormModal);
