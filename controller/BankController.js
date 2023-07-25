const oracledb = require("oracledb");

const addBank = async (
  bin,
  bankname,
  bankcontact,
  bankheadquater,
  bankemail
) => {
  try {
    const conn = await oracledb.getConnection();
    await conn.execute(
      `INSERT INTO bank (
      bin,
        bankname,
        bankcontact,
        bankheadquater,
        bankemail) 
    VALUES ( :bin,
        :bankname,
        :bankcontact,
        :bankheadquater,
        :bankemail)`,
      {
        bin,
        bankname,
        bankcontact,
        bankheadquater,
        bankemail,
      }
    );
    // console.log(bankaddress);
    await conn.commit();
    conn.close();
  } catch (error) {
    console.log(error);
  }
};

const getBanks = async () => {
  const conn = await oracledb.getConnection();
  const result = await conn.execute(
    `SELECT bin, bankname ,bankcontact, bankheadquater, bankemail FROM bank`
  );
  const result1 = result.rows.map((row) => {
    return {
      bin: row[0],
      bankname: row[1],
      bankcontact: row[2],
      bankheadquater: row[3],
      bankemail: row[4],
    };
  });
  conn.close();
  return result1;
};

const getBankByBin = async (bin) => {
  const conn = await oracledb.getConnection();

  const result = await conn.execute(
    `SELECT bin, bankname, bankcontact, bankheadquater, bankemail FROM bank WHERE bin = :bin`,
    { bin }
  );
  conn.close();
  return {
    bin: result.rows[0][0],
    bankname: result.rows[0][1],
    bankcontact: result.rows[0][2],
    bankheadquater: result.rows[0][3],
    bankemail: result.rows[0][4],
  };
};

const getCustomersByBin = async (id) => {
  const conn = await oracledb.getConnection();
  const status = 1;
  const result = await conn.execute(
    `SELECT c.customerid, c.customername,c.customeremail,c.customercontact, c.customeraddress   FROM customers c,bank b,account a where a.customerid=c.customerid and a.bin=b.bin and a.bin=:id and a.status=:status`,
    { id, status }
  );
  const result1 = result.rows.map((row) => {
    return {
      customerid: row[0],
      customername: row[1],
      customeremail: row[2],
      customeraddress: row[4],
      customercontact: row[3],
    };
  });
  conn.close();
  return result1;
};
module.exports = { addBank, getBanks, getBankByBin, getCustomersByBin };
