const express = require("express");
const controller = require("../controller/BankController");
const jose = require("node-jose");
const router = express.Router();
const fs = require("fs");

const publicKeyEncryption = require("fs").readFileSync("./public.key");
const publicKeyEncryptionApi = require("fs").readFileSync(
  "./public_api_key.pem"
);

const privateKeyDecryption = require("fs").readFileSync("./private.key");
const publicKeyVerification = require("fs").readFileSync("./public_sign.key");

router.get("/", async (req, res) => {
  console.log("bank api is fine");
  const message = "bank api is fine";
  const encryptionKey = await jose.JWK.asKey(publicKeyEncryptionApi, "pem");
  const encryptedres = await jose.JWE.createEncrypt(
    { format: "compact" },
    encryptionKey
  )
    .update(JSON.stringify(message))
    .final();

  res.status(200).json({ encryptedres });
});

router.post("/addbank", async (req, res) => {
  try {
    const signedData = req.body.signed;
    const verificationKey = await jose.JWK.asKey(publicKeyVerification, "pem");
    const verify = await jose.JWS.createVerify(verificationKey);
    const result = await verify.verify(signedData);
    const verifieddata = JSON.parse(result.payload.toString("utf8"));
    const { encrypted } = verifieddata;
    const decryptionKey = await jose.JWK.asKey(privateKeyDecryption, "pem");
    const decrypt = await jose.JWE.createDecrypt(decryptionKey);
    const decrypted = await decrypt.decrypt(encrypted);
    const decrypteddata = JSON.parse(decrypted.payload.toString("utf8"));
    const { bankname, bankcontact, bankheadquater, bankemail } = decrypteddata;
    const bin = Math.floor(Math.random() * 1000 + 400000);
    if (bankcontact.length == 10) {
      await controller.addBank(
        bin,
        bankname,
        bankcontact,
        bankheadquater,
        bankemail
      );
      const message = `${bankname} with${bin} added successfully`;
      const encryptionKey = await jose.JWK.asKey(publicKeyEncryptionApi, "pem");
      const encryptedres = await jose.JWE.createEncrypt(
        { format: "compact" },
        encryptionKey
      )
        .update(JSON.stringify(message))
        .final();
      res.status(200).json({ encrypted: encryptedres });
    } else {
      res
        .status(200)
        .json({ message: "Either bin or bankcontact are of invalid length " });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error adding bank" });
  }
});
router.get("/banks", async (req, res) => {
  try {
    const bank = await controller.getBanks();
    const formattedbanks = bank.map((bank) => {
      return {
        bin: bank.bin,
        bankname: bank.bankname,
        bankheadquater: bank.bankheadquater,
        bankcontact: bank.bankcontact,
        bankemail: bank.bankemail,
      };
    });

    const encryptionKey = await jose.JWK.asKey(publicKeyEncryptionApi, "pem");
    const encryptedres = await jose.JWE.createEncrypt(
      { format: "compact" },
      encryptionKey
    )
      .update(JSON.stringify(formattedbanks))
      .final();
    res.status(200).json({ encrypted: encryptedres });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/getbankbybin", async (req, res) => {
  try {
    const signedData = req.body.signed;
    const verificationKey = await jose.JWK.asKey(publicKeyVerification, "pem");
    const verify = await jose.JWS.createVerify(verificationKey);
    const result = await verify.verify(signedData);
    const verifieddata = JSON.parse(result.payload.toString("utf8"));
    const { encrypted } = verifieddata;
    const decryptionKey = await jose.JWK.asKey(privateKeyDecryption, "pem");
    const decrypt = await jose.JWE.createDecrypt(decryptionKey);
    const decrypted = await decrypt.decrypt(encrypted);
    const decrypteddata = JSON.parse(decrypted.payload.toString("utf8"));
    const { id } = decrypteddata;
    const bank = await controller.getBankByBin(id);
    if (!bank) {
      res.status(404).json({ error: "Bank not found" });
    } else {
      const formattedbank = {
        bin: bank.bin,
        bankname: bank.bankname,
        bankheadquater: bank.bankheadquater,
        bankcontact: bank.bankcontact,
        bankemail: bank.bankemail,
      };
      res.status(200).json(formattedbank);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/getcustomersbybin", async (req, res) => {
  try {
    const signedData = req.body.signed;
    const verificationKey = await jose.JWK.asKey(publicKeyVerification, "pem");
    const verify = await jose.JWS.createVerify(verificationKey);
    const result = await verify.verify(signedData);
    const verifieddata = JSON.parse(result.payload.toString("utf8"));
    const { encrypted } = verifieddata;
    const decryptionKey = await jose.JWK.asKey(privateKeyDecryption, "pem");
    const decrypt = await jose.JWE.createDecrypt(decryptionKey);
    const decrypted = await decrypt.decrypt(encrypted);
    const decrypteddata = JSON.parse(decrypted.payload.toString("utf8"));
    const { id } = decrypteddata;
    const customer = await controller.getCustomersByBin(id);
    const formattedCustomers = customer.map((customer) => {
      return {
        customerid: customer.customerid,
        customername: customer.customername,
        customeremail: customer.customeremail,
        customercontact: customer.customercontact,
        customeraddress: customer.customeraddress,
      };
    });
    res.status(200).json(formattedCustomers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
