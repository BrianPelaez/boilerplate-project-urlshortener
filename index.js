require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const { response } = require("express");
const { url } = require("inspector");
const { doesNotMatch } = require("assert");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.urlencoded());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use("/", (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

let links = [];
let id = 0;
// Your first API endpoint
app.post("/api/shorturl/", function (req, res) {
  const original_url = req.body.url;
  const regex =
    /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
  if (!regex.test(original_url)) {
    return res.json({ error: "invalid url" });
  }

  try {
    let urlObject = new URL(original_url);

    dns.lookup(urlObject.hostname, (err) => {
      if (err) {
        res.json({ error: "invalid url" });
      } else {
        id++;

        let newUrl = {
          original_url,
          short_url: id,
        };

        links.push(newUrl);
        res.json(newUrl);
      }
    });
  } catch (err) {
    res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const { short_url } = req.params;
  const redirectUrl = links.find(
    (link) => link.short_url === parseInt(short_url)
  );

  if (redirectUrl) {
    res.redirect(redirectUrl.original_url);
  } else {
    res.json("Not found");
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
