const oracledb = require("oracledb");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

const Deposit = async (customerid, bin, amount) => {
  let message = "Error";
  console.log(customerid);
  console.log(bin);
  console.log(amount);
  let connection = await oracledb.getConnection();

  try {
    const result = await connection.execute(
      `select accountbalance,accountnumber from account where customerid=:customerid and bin=:bin`,
      {
        customerid,
        bin,
      }
    );
    let accountbalance = result.rows[0][0];
    const accountnumber = result.rows[0][1];
    accountbalance = accountbalance + amount;
    console.log(accountbalance);
    const result1 = await connection.execute(
      `update account set accountbalance=:accountbalance where customerid=:customerid and bin=:bin`,
      {
        customerid,
        bin,
        accountbalance,
      }
    );
    const transactionResult = await connection.execute(
      `SELECT Transactionid.NEXTVAL FROM DUAL`
    );
    const transactionid = transactionResult.rows[0][0];
    console.log(transactionid);
    const debitamount = 0;
    const result2 = await connection.execute(
      `Insert into transaction(transactionid,debitamount,creditamount,customerid,accountnumber) values(:transactionid,:debitamount,:amount,:customerid,:accountnumber)`,
      {
        transactionid,
        debitamount,
        amount,
        customerid,
        accountnumber,
      }
    );
    console.log(result2);
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.commit();
        await connection.close();
        return message;
      } catch (error) {
        console.log(error);
      }
    }
  }

  return message;
};

const CardDeposit = async (cardnumber, amount, bin, pin) => {
  let connection;
  let message = "Error";

  try {
    connection = await oracledb.getConnection();
    const pinres = await connection.execute(
      `Select pin from card where cardnumber=:cardnumber`,
      {
        cardnumber,
      }
    );
    console.log(pinres);
    const respin = pinres.rows[0][0];
    const res = bcrypt.compareSync(pin, respin);
    console.log(respin);
    console.log(res);

    if (res == true) {
      const result = await connection.execute(
        `SELECT accountnumber,bin, cardstatus FROM card WHERE cardnumber = :cardnumber `,
        {
          cardnumber,
        }
      );
      // console.log(result);

      if (result) {
        const accountnumber = result.rows[0][0];
        const cardstatus = result.rows[0][2];
        const bin = result.rows[0][1];

        if (accountnumber) {
          if (
            cardstatus === "CHST0" ||
            cardstatus === "CHST14" ||
            cardstatus === "CHST29"
          ) {
            message = `${amount} Amount added to your account`;
            // console.log(amount);

            const balanceResult = await connection.execute(
              `Select accountbalance,customerid from account where  bin=:bin and accountnumber=:accountnumber `,
              {
                bin,
                accountnumber,
              }
            );

            console.log(accountnumber);
            // console.log(bin);
            console.log(balanceResult);
            let balance = balanceResult.rows[0][0];
            balance = balance + amount;
            console.log(balance);
            const result = await connection.execute(
              `UPDATE account SET accountbalance = :balance WHERE accountnumber = :accountnumber`,
              {
                accountnumber,
                balance,
              }
            );
            connection.commit();
            console.log(result);

            const transactionResult = await connection.execute(
              `SELECT Transactionid.NEXTVAL FROM DUAL`
            );
            const transactionid = transactionResult.rows[0][0];

            const debitamount = 0;
            const result6 = await connection.execute(
              `INSERT INTO transaction(transactionid,debitamount,creditamount,customerid,accountnumber) VALUES (:transactionid, :debitamount,:balance, :customerid,:accountnumber)`,
              {
                customerid,
                accountnumber,
                transactionid,
                debitamount,
                balance,
              }
            );
          } else {
            console.log("Card is deactivated");
            message = "Card is Deactivated or Blocked";
          }
        } else {
          console.log("INvalid");
          message = "Invalid Credentials";
        }
      } else {
        const resultpin = await connection.execute(
          `select pincount from card where cardnumber=:cardnumber`,
          {
            cardnumber,
          }
        );
        console.log(resultpin);
        const pincountres = resultpin.rows[0][0];
        const pincount = pincountres + 1;
        await connection.execute(
          `Update card set pincount=:pincount where cardnumber=:cardnumber`,
          {
            cardnumber,
            pincount,
          }
        );
      }
      console.log(result);
    } else {
      console.log("error");
    }
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.commit();
        await connection.close();
        return message;
      } catch (error) {
        console.log(error);
      }
    }
  }

  return message;
};

const RequestOtp = async (mobilenumber, bin, amount) => {
  let connection;

  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT c.CUSTOMERID, a.ACCOUNTBALANCE FROM customers c, account a WHERE a.BIN = :bin AND c.customerid = a.customerid AND c.CUSTOMERCONTACT = :mobilenumber`,
      {
        mobilenumber,
        bin,
      }
    );
    console.log(result);
    // console.log(mobilenumber);
    const customerid = result.rows[0][0];
    const balance = result.rows[0][1];
    console.log(balance);

    if (balance > amount) {
      const otp = genotp();
      // console.log(otp);
      const otpexpdate = new Date();
      console.log(otpexpdate);
      otpexpdate.setHours(otpexpdate.getHours() + 6);
      const requestResult = await connection.execute(
        `SELECT otprequestid.NEXTVAL FROM DUAL`
      );
      const requestid = requestResult.rows[0][0];

      await connection.execute(
        `INSERT INTO otp(requestid, otpnumber, otpexpdate, customerid, balance) VALUES (:requestid, :otp, :otpexpdate, :customerid, :amount)`,
        { requestid, otp, otpexpdate, customerid, amount }
      );
      const customerres = await connection.execute(
        `select customeremail from customers where customerid=:customerid`,
        { customerid }
      );

      const customeremail = customerres.rows[0][0];
      await sendOtpByEmail(customeremail, otp);
    }
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.commit();
        await connection.close();
      } catch (error) {
        console.log(error);
      }
    }
  }
};

const sendOtpByEmail = (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "prasidearning@gmail.com",
      pass: "jhcceofatedymkzc",
    },
  });

  const mailOptions = {
    from: "prasidearning@gmail.com",
    to: email,
    subject: "OTP for Cardless Withdrawal",
    text: `Your OTP for cardless withdrawal is ${otp}. Please use it within 6 hours.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("OTP sent: " + info.response);
    }
  });
};

const genotp = () => {
  const otp = Math.floor(Math.random() * 1000 + 1000);
  console.log(otp);
  return otp;
};

const cardlessWithdraw = async (mobilenumber, bin, otp) => {
  let connection;
  console.log(mobilenumber);
  console.log(otp);
  console.log(bin);

  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT o.OTPNUMBER, o.balance FROM otp o, customers c WHERE c.CUSTOMERID = o.CUSTOMERID AND c.CUSTOMERCONTACT = :mobilenumber and o.REQUESTID=(select max(REQUESTID) from otp )`,
      {
        mobilenumber,
      }
    );
    console.log(result);
    const dbotp = result.rows[0][0];
    const amount = result.rows[0][1];

    if (dbotp == otp) {
      const accountResult = await connection.execute(
        `SELECT a.accountnumber, a.ACCOUNTBALANCE, a.CUSTOMERID FROM account a, customers c WHERE c.CUSTOMERCONTACT = :mobilenumber AND c.CUSTOMERID = a.CUSTOMERID AND a.bin=:bin`,
        { mobilenumber, bin }
      );
      console.log(accountResult);
      const accountnumber = accountResult.rows[0][0];
      const balance = accountResult.rows[0][1];
      const customerid = accountResult.rows[0][2];
      const updatedbalance = balance - amount;

      const update = await connection.execute(
        `UPDATE account SET ACCOUNTBALANCE = :updatedbalance WHERE customerid = :customerid and bin=:bin`,
        {
          customerid,
          updatedbalance,
          bin,
        }
      );
      console.log(update);

      const transactionResult = await connection.execute(
        `SELECT Transactionid.NEXTVAL FROM DUAL`
      );
      console.log(transactionResult);
      const transactionid = transactionResult.rows[0][0];

      const creditamount = 0;
      const result6 = await connection.execute(
        `INSERT INTO transaction(transactionid,debitamount,creditamount,customerid,accountnumber) VALUES (:transactionid, :balance, :creditamount,:customerid,:accountnumber)`,
        {
          customerid,
          accountnumber,
          transactionid,
          creditamount,
          balance,
        }
      );
      console.log(result6);
    }
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.commit();
        await connection.close();
      } catch (error) {
        console.log(error);
      }
    }
  }
};

const CardWithdraw = async (cardnumber, amount, pin) => {
  let connection;
  let message = "Error";

  try {
    connection = await oracledb.getConnection();
    const pinres = await connection.execute(
      `Select pin from card where cardnumber=:cardnumber`,
      {
        cardnumber,
      }
    );
    const respin = pinres.rows[0][0];
    const res = bcrypt.compareSync(pin, respin);

    if (res == true) {
      const result = await connection.execute(
        `SELECT accountnumber, cardstatus FROM card WHERE cardnumber = :cardnumber `,
        {
          cardnumber,
        }
      );

      const accountnumber = result.rows[0][0];
      const cardstatus = result.rows[0][1];

      if (accountnumber) {
        if (
          cardstatus === "CHST0" ||
          cardstatus === "CHST14" ||
          cardstatus === "CHST29"
        ) {
          const balanceResult = await connection.execute(
            `SELECT accountbalance FROM account WHERE accountnumber = :accountnumber`,
            { accountnumber }
          );

          let balance = balanceResult.rows[0][0];
          if (balance < amount) {
            message = "Your account has insufficient balance";
          } else {
            message = `Your account is debited by ${amount}`;
            balance = balance - amount;

            await connection.execute(
              `UPDATE account SET accountbalance = :balance WHERE accountnumber = :accountnumber`,
              {
                accountnumber,
                balance,
              }
            );

            const transactionResult = await connection.execute(
              `SELECT Transactionid.NEXTVAL FROM DUAL`
            );
            const transactionid = transactionResult.rows[0][0];

            const creditamount = 0;
            await connection.execute(
              `INSERT INTO transaction(transactionid, cardnumber, debitamount, creditamount) VALUES (:transactionid, :cardnumber, :amount, :creditamount)`,
              {
                transactionid,
                cardnumber,
                creditamount,
                amount,
              }
            );
          }
        } else {
          message = "Card is Deactivated or Blocked";
        }
      } else {
        message = "Invalid Credentials";
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.commit();
        await connection.close();
      } catch (error) {
        console.log(error);
      }
    }
  }

  return message;
};

module.exports = {
  CardDeposit,
  CardWithdraw,
  RequestOtp,
  cardlessWithdraw,
  Deposit,
};
