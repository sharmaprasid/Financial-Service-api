const oracledb = require("oracledb");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

var message = "Error";

const genCard = async (
  cardid,
  cardnumber,
  cvv,
  pinexpdate,
  pincount,
  cardissuedate,
  cardexpdate,
  cardstatus,
  accountnumber,
  bin
) => {
  const randompin = Math.floor(Math.random() * cvv + 1000);
  console.log(randompin);
  var salt = bcrypt.genSaltSync(10);
  var pin = bcrypt.hashSync(`${randompin}`, salt);
  const conn = await oracledb.getConnection();
  try {
    console.log(accountnumber);
    console.log(bin);
    const emailres = await conn.execute(
      `select 
customeremail from customers 
where customerid=(select customerid from account where accountnumber=:accountnumber)`,
      { accountnumber }
    );
    const email = emailres.rows[0][0];
    console.log(email);
    sendPinByEmail(email, randompin);
    message = "created successfully";
    conn.execute(
      `Insert into card(cardid,
      cardnumber,
      cvv,
      pin,
      pinexpdate,
      pincount,
      cardissuedate,
      cardexpdate,
      cardstatus,
      accountnumber,
      bin) values(:cardid,
      :cardnumber,
      :cvv,
      :pin,
      :pinexpdate,
      :pincount,
      :cardissuedate,
      :cardexpdate,
      :cardstatus,
      :accountnumber,
      :bin)`,
      {
        cardid,
        cardnumber,
        cvv,
        pin,
        pinexpdate,
        pincount,
        cardissuedate,
        cardexpdate,
        cardstatus,
        accountnumber,
        bin,
      }
    );
  } catch (error) {
    console.log(error);
  }

  conn.commit();
  conn.close();
  return message;
};
const sendPinByEmail = (email, pin) => {
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
    subject: "YOur pin for card",
    text: `Your pin for card  is ${pin}. Please update your pin within 6 hours.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("PIN sent: " + info.response);
    }
  });
};
const blockCard = async (cardid, cardstatus) => {
  const conn = await oracledb.getConnection();
  var message = "Error";
  const result = await conn.execute(
    `select cardstatus from card where cardid=:cardid`,
    { cardid }
  );
  try {
    if (result.rows[0][0] != "CHST6") {
      message = "Card Blocked successfully";
      conn.execute(
        `Update card set cardstatus=:cardstatus where cardid=:cardid`,
        {
          cardid,
          cardstatus,
        }
      );
    } else {
      message = "Card already blocked";
    }
  } catch (error) {
    console.log(error);
  }

  conn.commit();
  conn.close();
  return message;
};
const unBlockCard = async (cardid, cardstatus) => {
  const conn = await oracledb.getConnection();
  const result = await conn.execute(
    `select cardstatus from card where cardid=:cardid`,
    {
      cardid,
    }
  );
  try {
    if ((result.rows[0][0] = "CHST6")) {
      message = "is blocked";
      conn.execute(
        `Update card set cardstatus=:cardstatus where cardid=:cardid `,
        {
          cardid,
          cardstatus,
        }
      );
    } else {
      message = "Is already unblocked";
    }
  } catch (error) {
    console.log(error);
  }

  conn.commit();
  conn.close();
};
const activateCard = async (cardid, cardstatus) => {
  var message = "is invalid card";
  const conn = await oracledb.getConnection();
  const result = await conn.execute(
    `select cardstatus from card where cardid=:cardid`,
    {
      cardid,
    }
  );
  // console.log(result.rows[0][0]);
  try {
    if ((result.rows[0][0] = "CHST12")) {
      message = "is activated";
      conn.execute(
        `Update card set cardstatus=:cardstatus where cardid=:cardid `,
        {
          cardid,
          cardstatus,
        }
      );
    } else {
      message = "is already activated";
    }
  } catch (error) {
    console.log(error);
  }

  conn.commit();

  conn.close();
  return message;
};
const getCardDetails = async (cardid) => {
  const conn = await oracledb.getConnection();

  const result = await conn.execute(
    `SELECT  cardnumber,pinexpdate,cardissuedate, cardexpdate,cardstatus FROM card WHERE cardid = :cardid `,
    { cardid }
  );
  const pinexpdate = result.rows[0][1];
  const cardissuedate = result.rows[0][2];
  const cardexpdate = result.rows[0][3];

  const pinformattedExpiryDate = new Date(pinexpdate).toLocaleString("en-US", {
    month: "2-digit",
    year: "2-digit",
  });
  const cardformattedIssueDate = new Date(cardissuedate).toLocaleString(
    "en-US",
    {
      month: "2-digit",
      year: "2-digit",
    }
  );
  const cardformattedExpiryDate = new Date(cardexpdate).toLocaleString(
    "en-US",
    {
      month: "2-digit",
      year: "2-digit",
    }
  );
  conn.commit();
  conn.close();
  return {
    cardnumber: result.rows[0][0],
    pinexpdate: pinformattedExpiryDate,
    cardissuedate: cardformattedIssueDate,
    cardexpdate: cardformattedExpiryDate,
    cardstatus: result.rows[0][4],
  };
};

const updatepin = async (cardnumber, curpin, updatepin, pinexpdate) => {
  const conn = await oracledb.getConnection();
  var message = "Error";

  const result = await conn.execute(
    `select pin from card where cardnumber=:cardnumber`,
    { cardnumber }
  );
  try {
    message = "Pin Updated";
    const pin = await bcrypt.compareSync(curpin, result.rows[0][0]);
    // bcrypt.hashSync(curpin, bcrypt.genSalt(10));
    console.log(pin);
    console.log(curpin);
    console.log(result.rows[0][0]);
    if (pin == "true") {
      conn.execute(
        `update card set pin=:updatepin ,pinexpdate=:pinexpdate where cardnumber=:cardnumber`,
        { updatepin, cardnumber, pinexpdate }
      );
    } else {
      message = "Your pin is incorrect";
    }
  } catch (error) {
    console.log(error);
  }
  conn.commit();
  conn.close();
  return message;
};

module.exports = {
  genCard,
  blockCard,
  unBlockCard,
  activateCard,
  getCardDetails,
  updatepin,
};
