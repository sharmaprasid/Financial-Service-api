const express = require("express");
const jose = require("node-jose");
const controller = require("../controller/AccountController");
const router = express.Router();
const fs = require("fs");
const publicKeyEncryption = require("fs").readFileSync("./public.key");
const publicKeyEncryptionApi = require("fs").readFileSync(
  "./public_api_key.pem"
);

const privateKeyDecryption = fs.readFileSync("./private.key");
const publicKeyVerification = fs.readFileSync("./public_sign.key");
router.post("/createaccount", async (req, res) => {
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
    const { customerId, Bin } = decrypteddata;
    const accountbalance = 0;
    const accountnumber = `${Bin}${customerId}`;
    await controller.createAccount(
      customerId,
      Bin,
      accountnumber,
      accountbalance
    );
    const message = `${customerId} account is created successfully with account number ${accountnumber}`;
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

router.post("/closeaccount", async (req, res) => {
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
    const { customerId, bin } = decrypteddata;
    await controller.closeaccount(customerId, bin);
    res.status(200).json({
      message: `${customerId} of bank with bin ${bin} closed successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal error" });
  }
});
module.exports = router;
