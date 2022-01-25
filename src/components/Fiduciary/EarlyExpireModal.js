import React from "react";
import { Button, Modal } from "react-bootstrap";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  setEarlyExpireVisibility,
  earlyExpire,
} from "./slice/fiduciaryProductList.actions";

const EarlyExpireModal = ({ actions, data, visible }) => {
  return (
    <Modal
      size="md"
      show={visible}
      onHide={() => {
        actions.setEarlyExpireVisibility(false, {});
      }}
      centered
    >
      <Modal.Header closeButton>
        <h3>Confirm Early Expire</h3>
      </Modal.Header>
      <Modal.Footer
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <Button
          variant="danger"
          onClick={() => actions.setEarlyExpireVisibility(false, {})}
        >
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={() => actions.earlyExpire({ ...data })}
        >
          Expire
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

function mapStateToProps(state) {
  return {
    visible: state.fiduciaryProductList.modals.earlyExpire.visible,
    data: state.fiduciaryProductList.modals.earlyExpire.data,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators(
      {
        setEarlyExpireVisibility,
        earlyExpire,
      },
      dispatch
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EarlyExpireModal);
