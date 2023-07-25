const jose = require("node-jose");
const express = require("express");
const bodyParser = require("body-parser");
//openssl genpkey -algorithm rsa -out private_key.pem
//openssl rsa -pubout -in private_key.pem -out public_key.pem
const privateKeyDecryptionApi = require("fs").readFileSync(
  "private_api_key.key"
);
const privateKeyDecryption = require("fs").readFileSync("private.key");
const privateKeySigning = require("fs").readFileSync("private_sign.key");

const publicKeyEncryption = require("fs").readFileSync("public.key");
const publicKeyVerification = require("fs").readFileSync("public_sign.key");

const app = express();
app.use(bodyParser.json());

app.post("/encrypt", async (req, res) => {
  try {
    const plaintext = req.body;
    const encryptionKey = await jose.JWK.asKey(publicKeyEncryption, "pem");
    const encrypted = await jose.JWE.createEncrypt(
      { format: "compact" },
      encryptionKey
    )
      .update(JSON.stringify(plaintext))
      .final();
    res.json({ encrypted });
  } catch (err) {
    res.status(500).json({ error: err.message || "Encryption failed." });
  }
});

app.post("/sign", async (req, res) => {
  try {
    const data = req.body;
    const signingKey = await jose.JWK.asKey(privateKeySigning, "pem");
    const sign = await jose.JWS.createSign({ format: "compact" }, signingKey);
    const signed = await sign.update(JSON.stringify(data), "utf8").final();
    res.json({ signed });
  } catch (err) {
    res.status(500).json({ error: err.message || "Signing failed." });
  }
});

app.post("/verify", async (req, res) => {
  try {
    const signedData = req.body.signed;
    const verificationKey = await jose.JWK.asKey(publicKeyVerification, "pem");
    const verify = await jose.JWS.createVerify(verificationKey);
    const result = await verify.verify(signedData);
    res.json({ verified: JSON.parse(result.payload.toString("utf8")) });
  } catch (err) {
    res.status(500).json({ error: err.message || "Verification failed." });
  }
});

app.post("/decrypt", async (req, res) => {
  try {
    const ciphertext = req.body.encrypted;
    const decryptionKey = await jose.JWK.asKey(privateKeyDecryption, "pem");
    const decrypt = await jose.JWE.createDecrypt(decryptionKey);
    const decrypted = await decrypt.decrypt(ciphertext);
    res.json({ decrypted: JSON.parse(decrypted.payload.toString("utf8")) });
  } catch (err) {
    res.status(500).json({ error: err.message || "Decryption failed." });
  }
});

app.post("/decrypt/api", async (req, res) => {
  try {
    const ciphertext = req.body.encrypted;
    const decryptionKey = await jose.JWK.asKey(privateKeyDecryptionApi, "pem");
    const decrypt = await jose.JWE.createDecrypt(decryptionKey);
    const decrypted = await decrypt.decrypt(ciphertext);
    res.json({ decrypted: JSON.parse(decrypted.payload.toString("utf8")) });
  } catch (err) {
    res.status(500).json({ error: err.message || "Decryption failed." });
  }
});

app.listen(4000, () => {
  console.log("Server is running on port 4000.");
});
