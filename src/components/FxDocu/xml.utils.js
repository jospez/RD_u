import * as XMLParser from "react-xml-parser";

export const parseXMLUpload = (file) => {
  if (file[0].type !== "text/xml") {
    console.log("Invalid File Type!");
    return;
  } else {
    try {
      const reader = new FileReader();
      reader.onabort = () => {
        throw new Error("file reading was aborted");
      };
      reader.onerror = () => {
        throw new Error("file reading has failed");
      };
      reader.onload = () => {
        const parsedText = new XMLParser().parseFromString(reader.result);
        let docuData = {};
        docuData.amount = parsedText.getElementsByTagName(
          "IssueCapitalisation"
        )[0].value;
        docuData.strike =
          parsedText.getElementsByTagName("StrikeLevel")[0].value;
        docuData.expieryHuman = parsedText
          .getElementsByTagName("sp:Attributes")
          .filter((value) => value.attributes.language === "en_GB")[0]
          .getElementsByTagName("sp:Term")[0]
          .getElementsByTagName("sp:Text")[0].value;
        docuData.expiry =
          parsedText.getElementsByTagName("PaymentFixingDate")[0].value +
          "T" +
          parsedText.getElementsByTagName("PaymentFixingTime")[0].value +
          "Z";
        docuData.time =
          parsedText.getElementsByTagName("PaymentFixingTime")[0].value;

        docuData.coupon = parseFloat(
          parsedText.getElementsByTagName("AnnualIncomeRate")[0].value / 100
        ).toFixed(6);

        docuData.investBase = "true";

        docuData.quoteCurrency = parsedText.getElementsByTagName(
          "FXUnderlyingCurrencyCode"
        )[0].value;
        docuData.baseCurrency =
          parsedText.getElementsByTagName("IssueCurrencyCode")[0].value;
        docuData.currency =
          parsedText.getElementsByTagName("BBTickerSymbol")[0].value;

        docuData.ownerBase64 = "";
        docuData.isin = parsedText.getElementsByTagName("IdValue")[0].value;
        docuData.comment = "";
        docuData.priority = 10;

        console.log(docuData);
        return docuData;
      };

      reader.readAsText(file[0]);
    } catch (e) {
      console.error(e);
      return;
    }
  }
};
