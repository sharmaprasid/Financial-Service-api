const oracledb = require("oracledb");
const dbconfig = {
  user: "prasid",
  password: "prasid123",
  connectionString: "localhost:1521/xe",
};
const Db = async () => {
  await oracledb
    .createPool(dbconfig)
    .then(console.log("connection pool created"));
  await oracledb.getConnection().then(console.log("connected to the database"));
};

module.exports = { Db };
