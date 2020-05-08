const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 7777;
const VideoRequestData = require("./data/video-requests.data");
const cors = require("cors");
const mongoose = require("./models/mongo.config");
const multer = require("multer");
if (!Object.keys(mongoose).length) return;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) =>
  res.send("Welcome to semicolon academy APIs, use /video-request to get data")
);
// you have to restart server to get affacted
// app.use(express.json); // way to handle if data send from frontend as json
// in case of form data we need to install npm install --save multer
// as server deal with data as upload form (multi part)
const upload = multer();
// server expect multi part in case of form data
// none as we do not send any file
app.post("/video-request", upload.none(), async (req, res, next) => {
  // console.log(req.body);
  const response = await VideoRequestData.createRequest(req.body);
  res.send(response);
  next();
});

app.get("/video-request", async (req, res, next) => {
  const { sortBy, searchTerm } = req.query;
  let data;

  if (searchTerm) {
    data = await VideoRequestData.searchRequests(searchTerm);
  } else {
    data = await VideoRequestData.getAllVideoRequests();
  }

  if (sortBy === "topVotedFirst") {
    data = data.sort((previous, next) => {
      if (
        previous.votes.ups - previous.votes.downs >
        next.votes.ups - next.votes.downs
      ) {
        return -1;
      } else {
        return 1;
      }
    });
  }
  res.send(data);
  next();
});

app.put("/video-request", async (req, res, next) => {
  const response = await VideoRequestData.updateRequest(req.body.id, req.body);
  res.send(response);
  next();
});

app.get("/users", async (req, res, next) => {
  const response = await UserData.getAllUsers(req.body);
  res.send(response);
  next();
});

app.post("/users/login", async (req, res, next) => {
  const response = await UserData.createUser(req.body);
  res.redirect(`http://localhost:5500?id=${response._id}`);
  next();
});

app.use(express.json()); // this means it expected => header application json

app.put("/video-request/vote", async (req, res, next) => {
  const { id, vote_type } = req.body;
  const response = await VideoRequestData.updateVoteForRequest(id, vote_type);
  res.send(response.votes);
  next();
});

app.delete("/video-request", async (req, res, next) => {
  const response = await VideoRequestData.deleteRequest(req.body.id);
  res.send(response);
  next();
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
