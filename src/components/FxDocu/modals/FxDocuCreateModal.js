import React, { useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import FxDocuCreateFormModal from "./FxDocuCreateFormModal";
import FxDocuCreateFromXMLModal from "./FxDocuCreateFromXMLModal";
import { createModal } from "../slice/fxDocuModals.actions.js";
import { issueFxDocu } from "../slice/issueFxDocu.actions.js";
import { useFxDocuContract } from "../hooks";
import ContractBadge from "../ContractBadge";

export const FxDocuCreateModal = ({ actions, isVisible }) => {
  const [context, setContext] = useState("FORM");
  const [docuData, setDocuData] = useState({});
  const { contractName } = useFxDocuContract();

  const createModalRef = useRef();

  return (
    <Modal
      size="lg"
      show={isVisible}
      onHide={() => {
        actions.createModal();
        if (context === "FORM") {
          createModalRef.current.resetForm();
          setTimeout(() => setContext("XML"), 300);
        }
      }}
      centered
    >
      <Modal.Header closeButton>
        <h1>Fx Docu</h1>
        <h5>
          <ContractBadge contractName={contractName} />
        </h5>
      </Modal.Header>
      {context === "XML" && (
        <FxDocuCreateFromXMLModal
          setContext={setContext}
          setDocuData={setDocuData}
        />
      )}
      {context === "FORM" && (
        <FxDocuCreateFormModal
          ref={createModalRef}
          setContext={setContext}
          docuData={docuData}
        />
      )}
    </Modal>
  );
};

function mapStateToProps(state) {
  return {
    isVisible: state.fxDocuModals.createModal.isVisible,
    data: state.fxDocuModals.createModal.data,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    actions: bindActionCreators(
      {
        createModal,
        issueFxDocu,
      },
      dispatch
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FxDocuCreateModal);
