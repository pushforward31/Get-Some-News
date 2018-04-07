// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require request and cheerio. This makes the scraping possible
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var logger = require("morgan");
var request = require("request");
var mongoose = require("mongoose");
var axios = require("axios");
var PORT = process.env.PORT || 3000;
// Initialize Express
var app = express();

// Require all models
var db = require("./models");

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

// // parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }));

// // parse application/json
// app.use(bodyParser.json());

// Set Handlebars.
var exphbs = require("express-handlebars"); 

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/films");
//     , {
//   useMongoClient: true
// });
// // Database configuration
// var databaseUrl = "films";
// var collections = ["movieNews"];



app.get("/", function(req, res) {

    res.render("index");
  });

// Retrieve data from the db
// app.get("/all", function(req, res) {
//     // Find all results from the scrapedData collection in the db
//     db.movieNews.find({}, function(error, found) {
//         // Throw any errors to the console
//         if (error) {
//             console.log(error);
//         }
//         // If there are no errors, send the data to the browser as json
//         else {
//             res.json(found);
//         }
//     });
// });







// Routes

// A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.fandango.com/movie-news").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("p.content-item-headline").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Create a new Article using the `result` object built from scraping
      db.news.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbnews);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all movieNews from the db
app.get("/movieNews", function(req, res) {
  // Grab every document in the movieNews collection
  db.news.find({})
    .then(function(dbnews) {
      // If we were able to successfully find movieNews, send them back to the client
      res.json(dbnews);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific news by id, populate it with it's note
app.get("/movieNews/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.news.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbnews) {
      // If we were able to successfully find an news with the given id, send it back to the client
      res.json(dbnews);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/movieNews/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.news.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbnews) {
      // If we were able to successfully update an news, send it back to the client
      res.json(dbnews);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// app.get("/scrape", function(req, res) {

//     // Making a request for fandango.com's homepage
//     request("https://www.fandango.com/movie-news", function(error, response, html) {

//         // Load the body of the HTML into cheerio
//         var $ = cheerio.load(response.data);

//         // Empty array to save our scraped data
//         var results = [];

//         // With cheerio, find each h4-tag with the class "headline-link" and loop through the results
//         $("p.content-item-headline").each(function(i, element) {

//             // Save the text of the h4-tag as "title"
//             var title = $(element).text();

//             // Find the h4 tag's parent a-tag, and save it's href value as "link"
//             var link = $(element).children().attr("href");

//             // Make an object with data we scraped for this h4 and push it to the results array
//             if (title && link) {
//                 // Insert the data in the scrapedData db
//                 db.movieNews.insert({
//                         title: title,
//                         link: link
//                     },
//                     function(err, inserted) {
//                         if (err) {
//                             // Log the error if one is encountered during the query
//                             console.log(err);
//                         } else {
//                             // Otherwise, log the inserted data
//                             console.log(inserted);
//                         }
//                     });
//             }
//         });

//         // After looping through each h4.headline-link, log the results
//         console.log(results);
//     });
//     res.send("Scrapte Complete");
// });

// Listen on port 3000
app.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);

});
