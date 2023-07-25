const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
// const joseStuff = require("./utils/JoseStuff");
const customerRoutes = require("./routes/CustomerRoutes");
const bankRoutes = require("./routes/BankRoutes");
const cardRoutes = require("./routes/CardRoutes");
const accountRoutes = require("./routes/AccountRoutes");
const transactionRoutes = require("./routes/TransactionRoutes");
const morgan = require("morgan");
const fs = require("fs");
const { Db } = require("./utils/Db");
const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

const port = process.env.PORT || 3000;
dotenv.config();
app.get("/", (req, res) => {
  res.json({ message: "Running" });
});

app.use(async (req, res, next) => {
  const logData = {
    timestamp: new Date(),
    path: req.path,
    method: req.method,
    user: req.headers["user"],
    request: req.body,
    response: null,
  };

  // joseStuff();

  const logString = JSON.stringify(logData);
  // const mal = await joseStuff(logString);
  // console.log(mal);

  fs.appendFile("request_logs.txt", logString + "\n", (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });

  res.sendResponse = res.send;
  res.send = async (body) => {
    logData.response = body;
    const updatedLogString = JSON.stringify(logData);
    // console.log(updatedLogString);
    // const man = await joseStuff(updatedLogString);
    // console.log(man);

    fs.appendFile("request_logs.txt", updatedLogString + "\n", (err) => {
      if (err) {
        console.error("Error writing to log file:", err);
      }
    });
    res.sendResponse(body);
  };

  next();
});

app.use("/api/customer", customerRoutes);
app.use("/bank", bankRoutes);
app.use("/card", cardRoutes);
app.use("/account", accountRoutes);
app.use("/transaction", transactionRoutes);
Db();
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});
