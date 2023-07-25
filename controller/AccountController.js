const oracledb = require("oracledb");
const createAccount = async (
  customerId,
  bin,
  accountnumber,
  accountbalance
) => {
  const conn = await oracledb.getConnection();
  const status = 1;
  conn.execute(
    `Insert into account(accountnumber,customerid,bin,accountbalance,status) values(:accountnumber,:customerid,:bin,:accountbalance,:status)`,
    {
      accountnumber,
      customerId,
      bin,
      accountbalance,
      status,
    }
  );
  conn.execute(
    `update customers set status=:status where customerid=:customerId`,
    {
      customerId,
      status,
    }
  );
  conn.commit();
  conn.close();
};

const closeaccount = async (customerid, bin) => {
  const conn = await oracledb.getConnection();
  const status = "0";
  await conn.execute(
    `Update account set status=:status where customerid=:customerid and bin=:bin `,
    {
      status,
      customerid,
      bin,
    }
  );
  conn.commit();
};

module.exports = {
  createAccount,
  closeaccount,
};
