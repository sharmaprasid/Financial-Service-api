const express = require("express");
const fs = require("fs");
const controller = require("../controller/CardController");

const router = express.Router();
const publicKeyEncryption = require("fs").readFileSync("./public.key");
const publicKeyEncryptionApi = require("fs").readFileSync(
  "./public_api_key.pem"
);
const jose = require("node-jose");
const privateKeyDecryption = fs.readFileSync("./private.key");
const publicKeyVerification = fs.readFileSync("./public_sign.key");
router.post("/gencard", async (req, res) => {
  try {
    const signedData = req.body.signed;
    const verificationKey = await jose.JWK.asKey(publicKeyVerification, "pem");
    const verify = await jose.JWS.createVerify(verificationKey);
    const result = await verify.verify(signedData);
    const verifieddata = JSON.parse(result.payload.toString("utf8"));
    console.log(verifieddata);
    const { encrypted } = verifieddata;
    const decryptionKey = await jose.JWK.asKey(privateKeyDecryption, "pem");
    const decrypt = await jose.JWE.createDecrypt(decryptionKey);
    const decrypted = await decrypt.decrypt(encrypted);
    console.log(decrypted);
    const decrypteddata = JSON.parse(decrypted.payload.toString("utf8"));
    const { accountnumber, bin, cardstatus } = decrypteddata;
    const cvv = Math.floor(Math.random() * 100 + 100);

    // const salt = bcrypt.genSaltSync(10);
    // console.log(randompin);

    const cardid = Math.floor(Math.random() * 1000 + 10000000);
    const randomunique = Math.floor(Math.random() * 1000 + cardid);
    const randomunique1 = Math.floor(Math.random() * 100 + 12);
    const cardnumber = `${bin}${randomunique}${randomunique1}`;

    const cardissuedate = new Date();

    const pinexpdate = new Date();
    pinexpdate.setMonth(pinexpdate.getMonth() + 3);

    const pincount = 0;
    const cardexpdate = new Date();
    cardexpdate.setFullYear(cardissuedate.getFullYear() + 4);
    console.log(accountnumber);
    const message = await controller.genCard(
      cardid,
      cardnumber,
      cvv,
      pinexpdate,
      pincount,
      cardissuedate,
      cardexpdate,
      cardstatus,
      accountnumber,
      bin
    );
    const result1 = ` ${cardnumber} ${message}`;
    const encryptionKey = await jose.JWK.asKey(publicKeyEncryptionApi, "pem");
    const encryptedres = await jose.JWE.createEncrypt(
      { format: "compact" },
      encryptionKey
    )
      .update(JSON.stringify(result1))
      .final();
    res.status(200).json({ encrypted: encryptedres });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/blockcard", async (req, res) => {
  try {
    const signedData = req.body.signed;
    const verificationKey = await jose.JWK.asKey(publicKeyVerification, "pem");
    const verify = await jose.JWS.createVerify(verificationKey);
    const result = await verify.verify(signedData);
    const verifieddata = JSON.parse(result.payload.toString("utf8"));
    console.log(verifieddata);
    const { encrypted } = verifieddata;
    const decryptionKey = await jose.JWK.asKey(privateKeyDecryption, "pem");
    const decrypt = await jose.JWE.createDecrypt(decryptionKey);
    const decrypted = await decrypt.decrypt(encrypted);
    console.log(decrypted);
    const decrypteddata = JSON.parse(decrypted.payload.toString("utf8"));
    const { cardid, cardstatus } = decrypteddata;
    const message = await controller.blockCard(cardid, cardstatus);
    const result1 = `${cardid} ${message}`;
    const encryptionKey = await jose.JWK.asKey(publicKeyEncryptionApi, "pem");
    const encryptedres = await jose.JWE.createEncrypt(
      { format: "compact" },
      encryptionKey
    )
      .update(JSON.stringify(result1))
      .final();
    res.status(200).json({ encrypted: encryptedres });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
});
router.post("/unblockcard", async (req, res) => {
  try {
    const signedData = req.body.signed;
    const verificationKey = await jose.JWK.asKey(publicKeyVerification, "pem");
    const verify = await jose.JWS.createVerify(verificationKey);
    const result = await verify.verify(signedData);
    const verifieddata = JSON.parse(result.payload.toString("utf8"));
    console.log(verifieddata);
    const { encrypted } = verifieddata;
    const decryptionKey = await jose.JWK.asKey(privateKeyDecryption, "pem");
    const decrypt = await jose.JWE.createDecrypt(decryptionKey);
    const decrypted = await decrypt.decrypt(encrypted);
    console.log(decrypted);
    const decrypteddata = JSON.parse(decrypted.payload.toString("utf8"));
    const { cardid, cardstatus } = decrypteddata;
    const message = await controller.unBlockCard(cardid, cardstatus);
    const result1 = `cardid ${cardid} ${message}`;
    const encryptionKey = await jose.JWK.asKey(publicKeyEncryptionApi, "pem");
    const encryptedres = await jose.JWE.createEncrypt(
      { format: "compact" },
      encryptionKey
    )
      .update(JSON.stringify(result1))
      .final();
    res.status(200).json({ encrypted: encryptedres });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
});
router.post("/activatecard", async (req, res) => {
  try {
    const signedData = req.body.signed;
    const verificationKey = await jose.JWK.asKey(publicKeyVerification, "pem");
    const verify = await jose.JWS.createVerify(verificationKey);
    const result = await verify.verify(signedData);
    const verifieddata = JSON.parse(result.payload.toString("utf8"));
    console.log(verifieddata);
    const { encrypted } = verifieddata;
    const decryptionKey = await jose.JWK.asKey(privateKeyDecryption, "pem");
    const decrypt = await jose.JWE.createDecrypt(decryptionKey);
    const decrypted = await decrypt.decrypt(encrypted);
    console.log(decrypted);
    const decrypteddata = JSON.parse(decrypted.payload.toString("utf8"));
    const { cardid, cardstatus } = decrypteddata;
    console.log(cardid);
    const message = await controller.activateCard(cardid, cardstatus);
    const result1 = `${cardid} ${message}`;
    const encryptionKey = await jose.JWK.asKey(publicKeyEncryptionApi, "pem");
    const encryptedres = await jose.JWE.createEncrypt(
      { format: "compact" },
      encryptionKey
    )
      .update(JSON.stringify(result1))
      .final();
    res.status(200).json({ encrypted: encryptedres });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
});
router.post("/updatepin", async (req, res) => {
  try {
    const signedData = req.body.signed;
    const verificationKey = await jose.JWK.asKey(publicKeyVerification, "pem");
    const verify = await jose.JWS.createVerify(verificationKey);
    const result = await verify.verify(signedData);
    const verifieddata = JSON.parse(result.payload.toString("utf8"));
    console.log(verifieddata);
    const { encrypted } = verifieddata;
    const decryptionKey = await jose.JWK.asKey(privateKeyDecryption, "pem");
    const decrypt = await jose.JWE.createDecrypt(decryptionKey);
    const decrypted = await decrypt.decrypt(encrypted);
    console.log(decrypted);
    const decrypteddata = JSON.parse(decrypted.payload.toString("utf8"));
    const { cardnumber, currpin, updatepin } = decrypteddata;
    const pinexpdate = Date.now() * 30 * 60 * 60 * 1000;

    const message = await controller.updatepin(
      cardnumber,
      currpin,
      updatepin,
      pinexpdate
    );
    const result1 = `${message}`;
    const encryptionKey = await jose.JWK.asKey(publicKeyEncryptionApi, "pem");
    const encryptedres = await jose.JWE.createEncrypt(
      { format: "compact" },
      encryptionKey
    )
      .update(JSON.stringify(result1))
      .final();
    res.status(200).json({ encrypted: encryptedres });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const carddetails = await controller.getCardDetails(id);
    if (!carddetails) {
      res.status(404).json({ error: "card not valid" });
    } else {
      const formattedCustomer = {
        cardnumber: carddetails.cardnumber,
        pinexpdate: carddetails.pinexpdate,
        cardissuedate: carddetails.cardissuedate,
        cardexpdate: carddetails.cardexpdate,
        cardstatus: carddetails.cardstatus,
      };
      const encryptionKey = await jose.JWK.asKey(publicKeyEncryptionApi, "pem");
      const encryptedres = await jose.JWE.createEncrypt(
        { format: "compact" },
        encryptionKey
      )
        .update(JSON.stringify(formattedCustomer))
        .final();
      res.status(200).json({ encrypted: encryptedres });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
});
module.exports = router;
