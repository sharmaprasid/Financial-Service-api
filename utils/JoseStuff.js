const jose = require("node-jose");
const fs = require("fs");

const encryption = async () => {
  const privateKey = fs.readFileSync("private_key.pem");
  const publicKey = fs.readFileSync("public_key.pem");

  const jwkKey = await jose.JWK.asKey(privateKey, "pem");

  const encryptionKey = await jose.JWK.asKey(publicKey, "pem");
  let keystore;
  keystore = jose.JWK.createKeyStore();
  keystore.add(jwkKey);
  keystore.add(encryptionKey);
  console.log(keystore);
  const jsonData = { man: "hello man", manman: "hello manman" };
  const jsonString = JSON.stringify(jsonData);

  const encrypted = await jose.JWE.createEncrypt(encryptionKey)
    .update(jsonString, "utf8")
    .final();

  const signed = await jose.JWS.createSign(jwkKey)
    .update(jsonString, "utf8")
    .final();
  console.log(signed);
  //  openssl create  keypair openssl genkey -algorithm rsa -out privatekey.pem
  //  openssl extract public key  openssl rsa -pubout -in privatekey.pem -out public_key.pem

  await jose.JWS.createVerify(encryptionKey)
    .verify(signed)
    .then(function (result) {
      console.log(result);
      //   const payload1 = result.payload.toString();
      //   console.log(payload1);
    });

  const decrypted = await jose.JWE.createDecrypt(jwkKey).decrypt(encrypted);

  const decryptedPayload = decrypted.payload.toString();

  const decryptedJson = JSON.parse(decryptedPayload);
  console.log(decryptedJson);

  //   console.log("Encrypted:", encrypted);
  //   console.log("Decrypted:", decryptedJson);
  // return encrypted;
};
encryption().catch((error) => {
  console.log(error);
});
