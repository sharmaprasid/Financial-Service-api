const oracledb = require("oracledb");
const registerCustomer = async (
  customername,
  customeremail,
  customercontact,
  customeraddress
) => {
  const conn = await oracledb.getConnection();
  const result = await conn.execute(`SELECT customer_seq.NEXTVAL FROM DUAL`);
  const customerid = result.rows[0][0];
  console.log(customerid);

  await conn.execute(
    `INSERT INTO customers (
      customerid,
      customername,
      customeremail,
      customercontact,
      customeraddress
    ) 
    VALUES (
      :customerid,
      :customername,
      :customeremail,
      :customercontact,
      :customeraddress
    )`,
    {
      customerid,
      customername,
      customeremail,
      customercontact,
      customeraddress,
    }
  );
  await conn.commit();
  conn.close();
};

const getCustomerById = async (customerid) => {
  const conn = await oracledb.getConnection();

  const result = await conn.execute(
    `SELECT customerid, customername,customeremail,customercontact, customeraddress FROM customers WHERE customerid = :customerid `,
    { customerid }
  );
  conn.close();
  return {
    customerid: result.rows[0][0],
    customername: result.rows[0][1],
    customeremail: result.rows[0][2],
    customeraddress: result.rows[0][3],
    customercontact: result.rows[0][4],
  };
};

// const deleteCustomerfrombank = async (bin, customerid) => {
//   const status = "0";
//   const conn = await oracledb.getConnection();
//   await conn.execute(
//     `UPDATE CUSTOMER SET STATUS=:status WHERE CUSTOMERID=:customerid and bin:bin `,
//     {
//       customerid,
//       status,
//       bin,
//     }
//   );
//   await conn.commit();
//   conn.close();
// };

const updateCustomerName = async (customerid, customername) => {
  const conn = await oracledb.getConnection();

  await conn.execute(
    `UPDATE customer SET customername = :customername WHERE customerid = :customerid`,
    {
      customerid,
      customername,
    }
  );
  await conn.commit();
  conn.close();
};
const updateCustomerEmail = async (customerid, customeremail) => {
  const conn = await oracledb.getConnection();

  await conn.execute(
    `UPDATE customer SET customeremail = :customeremail WHERE customerid = :customerid`,
    {
      customerid,
      customeremail,
    }
  );
  await conn.commit();
  conn.close();
};

module.exports = {
  registerCustomer,
  // getCustomersByBin,
  updateCustomerEmail,
  getCustomerById,
  updateCustomerName,
};
