require("dotenv").config({ path: "config/.env" });
// This is your test secret API key.
const connectDatabase = require('./config/DB');
const express = require('express');
const path=require("path")
const app = express();
app.use(express.json({
  limit: '50mb'
}));

const cors=require("cors")
app.use(cors())
const cloudinary=require("cloudinary")
connectDatabase()
cloudinary.config({
    cloud_name: process.env.Cloud_Name,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });
// shop Routes
const shopRoutes=require("./routes");
app.use("/",shopRoutes)

app.use(express.static(path.join(__dirname, "./client/dist")));
app.get("*", function (_, res) {
  res.sendFile(
    path.join(__dirname, "./client/dist/index.html"),
    function (err) {
      res.status(500).send(err);
    }
  );
});

app.listen(4242, () => console.log('Running on port 4242'));
