const express = require("express");
const exphbs = require("express-handlebars");
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

const db = require("./models");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scarperData";

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true }, (err) => {
    if (err) throw err;
    console.log("Database Connected!");
  });

app.get("/", (req, res) => {
  db.Article
    .find({})
    .populate("comments")
    .then(dbArticles => {
      res.render("home", { articles: dbArticles });
    });
});

app.get("/scrape", (req, res) => {
  axios
    .get("https://www.npr.org/sections/art-design/")
    .then(response => {
      const $ = cheerio.load(response.data);
      $("articles").each(function (i, element) {
        let title = $(element).find("h2").find("a").text();
        let link = $(element).find("h2").find("a").attr("href");
        let summary = $(element).find("p").text();
        let postObj = {
          title: title,
          link: link,
          summary: summary
        };
        db.Article
          .create(postObj)
          .then(dbArticle => console.log(dbArticle))
          .catch(err => console.log(err));
      });
      res.send("Scraped data");
    });
});

app.get("/articles", (req, res) => {
  db.Article.find({})
    .then((dbArticles) => {
      res.json(dbArticles);
    })
    .catch((err) => {
      res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the Comments associated with it
    .populate("comment")
    .then(function(dbArticles) {
      res.json(dbArticles);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Comment
app.post("/articles/:id", function(req, res) {
  // Create a new Comment and pass the req.body to the entry
  db.Comment.create(req.body)
    
    .then(function(dbComment) {
      // If a Comment was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Comment
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate(
        { _id: req.params.id }, 
        { comment: dbComment._id }, 
        { new: true }
        );
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.listen(PORT, () => console.log(`App listening on http://localhost:${PORT}`));
