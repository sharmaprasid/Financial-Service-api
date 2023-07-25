const express = require("express");
const controller = require("../controller/CustomerController");
const jose = require("node-jose");
const fs = require("fs");
const publicKeyEncryption = require("fs").readFileSync("./public.key");
const publicKeyEncryptionApi = require("fs").readFileSync(
  "./public_api_key.pem"
);

const privateKeyDecryption = fs.readFileSync("./private.key");
const publicKeyVerification = fs.readFileSync("./public_sign.key");

// const { verifyToken } = require("../utils/verifyToken");

const router = express.Router();

router.post("/registercustomer", async (req, res) => {
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

    const { customerName, customerEmail, customerContact, customerAddress } =
      decrypteddata;
    console.log(customerName);
    await controller.registerCustomer(
      customerName,
      customerEmail,
      customerContact,
      customerAddress
    );
    const message = "customer created";
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
    res.status(500).json({ error: "Internal server error" });
  }
});

// const mal = JSON.stringify(hi);
// console.log(mal);

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await controller.getCustomerById(id);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
    } else {
      const formattedCustomer = {
        customerid: customer.customerid,
        customername: customer.customername,
        customeraddress: customer.customeraddress,
        customercontact: customer.customercontact,
        customeremail: customer.customeremail,
      };

      const encryptionKey = await jose.JWK.asKey(publicKeyEncryption, "pem");
      const encrypted = await jose.JWE.createEncrypt(
        { format: "compact" },
        encryptionKey
      )
        .update(JSON.stringify(formattedCustomer))
        .final();

      res.status(200).json({ encrypted });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/updatecustomername/", async (req, res) => {
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
    const { id, customername } = decrypteddata;
    await controller.updateCustomerName(id, customername);
    const message = "customer updated";
    const encryptionKey = await jose.JWK.asKey(publicKeyEncryptionApi, "pem");
    const encryptedres = await jose.JWE.createEncrypt(
      { format: "compact" },
      encryptionKey
    )
      .update(JSON.stringify(message))
      .final();
    res.status(200).json({ encrypted: encryptedres });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/updatecustomeremail", async (req, res) => {
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
    const { id, email } = decrypteddata;
    await controller.updateCustomerEmail(id, email);
    const message = `Customer with customerid ${id} email is updated `;
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
    res.status(500).json({ message: "Internal Server error" });
  }
});
// router.put("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { customername, customeraddress, customercontact, customeremail } =
//       req.body;
//     await controller.updateCustomer(
//       id,
//       customername,
//       customeraddress,
//       customercontact,
//       customeremail
//     );
//     res.status(200).json({ message: "Customer updated" });
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// router.put("/closeaccount", async (req, res) => {
//   try {
//     const { bin, customerid } = req.body;
//     await controller.deleteCustomerfrombank(bin, customerid);
//     res.status(200).json({ message: "Customer Account deleted from bank" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

module.exports = router;
