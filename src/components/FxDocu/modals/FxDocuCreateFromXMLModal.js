import React, { useCallback } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDropzone } from "react-dropzone";

import { ReactComponent as UploadIcon } from "../../../assets/icons/upload.svg";
import { parseXMLUpload } from "../xml.utils";

export const FxDocuCreateFromXMLModal = ({ setDocuData, setContext }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const docuData = parseXMLUpload(acceptedFiles);
    console.log(docuData);
    if (docuData) {
      setDocuData(docuData);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <>
      <Modal.Body>
        <section
          {...getRootProps()}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "30rem",
          }}
        >
          <input {...getInputProps()} />
          <UploadIcon />
          <p>Upload DOCU XML</p>
        </section>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => setContext("FORM")}>Enter manully</Button>
      </Modal.Footer>
    </>
  );
};

export default FxDocuCreateFromXMLModal;
