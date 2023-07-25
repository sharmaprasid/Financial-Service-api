const express = require("express");
const controller = require("../controller/TransactionController");
const router = express.Router();
const jose = require("node-jose");
const publicKeyEncryption = require("fs").readFileSync("./public.key");
const publicKeyEncryptionApi = require("fs").readFileSync(
  "./public_api_key.pem"
);

const privateKeyDecryption = require("fs").readFileSync("./private.key");
const publicKeyVerification = require("fs").readFileSync("./public_sign.key");
router.post("/deposit", async (req, res) => {
  try {
    const signedData = req.body.signed;
    const verificationKey = await jose.JWK.asKey(publicKeyVerification, "pem");
    const verify = await jose.JWS.createVerify(verificationKey);
    const result = await verify.verify(signedData);
    const verifieddata = JSON.parse(result.payload.toString("utf8"));
    // console.log(verifieddata);
    const { encrypted } = verifieddata;
    const decryptionKey = await jose.JWK.asKey(privateKeyDecryption, "pem");
    const decrypt = await jose.JWE.createDecrypt(decryptionKey);
    const decrypted = await decrypt.decrypt(encrypted);
    // console.log(decrypted);
    const decrypteddata = JSON.parse(decrypted.payload.toString("utf8"));
    const { customerid, bin, Amount } = decrypteddata;
    const amount = parseInt(Amount);

    const message = await controller.Deposit(customerid, bin, amount);
    const encryptionKey = await jose.JWK.asKey(publicKeyEncryptionApi, "pem");
    const encryptedres = await jose.JWE.createEncrypt(
      { format: "compact" },
      encryptionKey
    )
      .update(JSON.stringify(message))
      .final();
    res.status(200).json({ encrypted: encryptedres });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
});
router.post("/carddeposit", async (req, res) => {
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

    const decrypteddata = JSON.parse(decrypted.payload.toString("utf8"));
    console.log(decrypteddata);
    const { cardnumber, Amount, bin, pin } = decrypteddata;
    const amount = parseInt(Amount);

    const message = await controller.CardDeposit(cardnumber, amount, bin, pin);
    console.log(bin);
    const encryptionKey = await jose.JWK.asKey(publicKeyEncryptionApi, "pem");
    const encryptedres = await jose.JWE.createEncrypt(
      { format: "compact" },
      encryptionKey
    )
      .update(JSON.stringify(message))
      .final();
    res.status(200).json({ encrypted: encryptedres });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log(error);
  }
});
router.post("/cardwithdraw", async (req, res) => {
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
    const { cardnumber, Amount, pin } = decrypteddata;

    const amount = parseInt(Amount);
    const message = await controller.CardWithdraw(cardnumber, amount, pin);
    const encryptionKey = await jose.JWK.asKey(publicKeyEncryptionApi, "pem");
    const encryptedres = await jose.JWE.createEncrypt(
      { format: "compact" },
      encryptionKey
    )
      .update(JSON.stringify(message))
      .final();
    res.status(200).json({ encrypted: encryptedres });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/cardlesswithdraw/requestotp", async (req, res) => {
  try {
    const signedData = req.body.signed;
    const verificationKey = await jose.JWK.asKey(publicKeyVerification, "pem");
    const verify = await jose.JWS.createVerify(verificationKey);
    const result = await verify.verify(signedData);
    const verifieddata = JSON.parse(result.payload.toString("utf8"));
    // console.log(verifieddata);
    const { encrypted } = verifieddata;
    const decryptionKey = await jose.JWK.asKey(privateKeyDecryption, "pem");
    const decrypt = await jose.JWE.createDecrypt(decryptionKey);
    const decrypted = await decrypt.decrypt(encrypted);
    // console.log(decrypted);
    const decrypteddata = JSON.parse(decrypted.payload.toString("utf8"));
    const { mobilenumber, bin, amount } = decrypteddata;

    await controller.RequestOtp(mobilenumber, bin, amount);
    const message = `OTP is send to ${mobilenumber}`;
    const encryptionKey = await jose.JWK.asKey(publicKeyEncryptionApi, "pem");
    const encryptedres = await jose.JWE.createEncrypt(
      { format: "compact" },
      encryptionKey
    )
      .update(JSON.stringify(message))
      .final();
    res.status(200).json({ encrypted: encryptedres });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post("/cardlessWithdraw/deduct", async (req, res) => {
  try {
    const signedData = req.body.signed;
    const verificationKey = await jose.JWK.asKey(publicKeyVerification, "pem");
    const verify = await jose.JWS.createVerify(verificationKey);
    const result = await verify.verify(signedData);
    const verifieddata = JSON.parse(result.payload.toString("utf8"));
    // console.log(verifieddata);
    const { encrypted } = verifieddata;
    // console.log(encrypted);
    const decryptionKey = await jose.JWK.asKey(privateKeyDecryption, "pem");
    const decrypt = await jose.JWE.createDecrypt(decryptionKey);
    const decrypted = await decrypt.decrypt(encrypted);
    console.log(decrypted);
    const decrypteddata = JSON.parse(decrypted.payload.toString("utf8"));
    console.log(decrypteddata);
    const { mobilenumber, bin, otp } = decrypteddata;
    console.log(mobilenumber);
    await controller.cardlessWithdraw(mobilenumber, bin, otp);

    const message = "Amount Deducted successfully";
    const encryptionKey = await jose.JWK.asKey(publicKeyEncryptionApi, "pem");
    const encryptedres = await jose.JWE.createEncrypt(
      { format: "compact" },
      encryptionKey
    )
      .update(JSON.stringify(message))
      .final();
    res.status(200).json({ encrypted: encryptedres });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
});

module.exports = router;
