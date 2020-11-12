// Imports all the appropriate modules for the API
const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  passport = require('passport'),
  cors = require('cors');
  require('./passport');
const {check, validationResult} = require('express-validator');


// Imports the appropriate object models from Mongoose
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

//Connects the MongoDB database for use here
// mongoose.connect('mongodb://localhost:27017/myFlixDB', {useNewUrlParser: true, useUnifiedTopology: true}); // This is the local database on my computer
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true}); // This is the database hosted on MongoDB Atlas

//Allows the use of express
const app = express();

app.use(bodyParser.json()); // This is the bodyParser middleware function
app.use(cors()); // Allows the use of CORS (Cross-Origin Resource Sharing)
let auth = require('./auth')(app); // This imports my "auth.js" file, and the "(app)" part ensures that Express is available in the "auth.js" file as well

//When the user enters a url into the browser this logs a timestamp and the pathName to the console/terminal
app.use(morgan('common'));

 //This should serve the "documentation.html" file to the browser
app.use('/documentation', express.static('public'));

app.use((err, req, res, next) => { //This is the error handling function
  console.error(err.stack);
  res.status(500).send('Something broke');
});


// DIFFERENT REQUEST TYPES AND THEIR METHODS
// This shows the default message
app.get('/', (req, res) => {
  res.send('This is the default textual response page');
});

// This shows a list of all the movie objects
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) =>{
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// This shows the details for a movie based on the movie name
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({Title: req.params.Title}) // This finds a movie by it's title in the request
    .then((movie) => {
      res.status(201).json(movie); //This sends back the movie object in JSON format
    })
    .catch((err) => { //Catches errors
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// This shows information about a specific genre(description) by name/title
app.get('/genres/:Genre', passport.authenticate('jwt', {session: false}), (req, res) => {
  Genres.findOne({Name: req.params.Genre}) //Finds the genre by name from the "Genres" collection in the database
    .then((genre) => {
      res.status(201).json(genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// This shows information about a specific director by name
app.get('/directors/:Director', passport.authenticate('jwt', {session: false}), (req, res) => {
  Directors.findOne({Name: req.params.Director}) //Finds the genre by name from the "Genres" collection in the database
    .then((director) => {
      res.status(201).json(director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// This shows more info about a specific user based on the username in the query
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOne({Username: req.params.Username}) //This finds a user by their username that they put in the request
  .then((user) => {
    res.status(201).json(user); //This returns their info in JSON format
  })
  .catch((err) => { //This section catches any errors and sends back a message with an error code of '500'
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

// Registers a new user
app.post('/users',
  [
    check('Username', 'Username must be at least 5 characters').isLength({min: 5}), // The following lines use the "express validator" library which validates all kinds of input data
    check('Username', 'Username contains non alphanumeric characters - not allowed. (i.e. no spaces)').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Must be a valid Email').isEmail()
  ], (req, res) => {

    let errors = validationResult(req); // checks the validation object above for errors

    if (!errors.isEmpty()) { // verifys that there weren't any errors with the inputs and returns a list of errors if there are
      return res.status(422).json({errors: errors.array()});
    }

    let hashedPassword = Users.hashPassword(req.body.Password); //Hashes the password to store in the database
    Users.findOne({ Username: req.body.Username }) //This queries the "Users" model using mongoose
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username = 'That username already exists. Try a different name.'); //This returns the 'already exists' message if that username already exists
        } else {
          Users.create({ //This section creates a new user profile based on the query and adds it to the Mongo Database
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => {res.status(201).json(user) }) //This sends the new user info back as a response in JSON format
            .catch((error) => { //This section catches any errors and sends back a message with an error code of '500'
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => { //This section catches any errors and sends back a message with an error code of '500'
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
});

// This allows the user to update their info
app.put('/users/:Username', passport.authenticate('jwt', {session: false}),
  [
      check('Username', 'Username must be at least 5 characters').isLength({min: 5}), // The following lines use the "express validator" library which validates all kinds of input data
      check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
      check('Password', 'Password is required').not().isEmpty(),
      check('Email', 'Must be a valid Email').isEmail()
  ], (req, res) => {

      let errors = validationResult(req); // checks the validation object above for errors

      if (!errors.isEmpty()) { // verifys that there weren't any errors with the inputs and returns a list of errors if there are
        return res.status(422).json({errors: errors.array()});
      }

      let hashedPassword = Users.hashPassword(req.body.Password); //Hashes the password to store in the database
      Users.findOneAndUpdate({ Username: req.params.Username},{ $set: //This section finds a user in the database by name and updates their info
        {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      {new: true}, //This line makes sure the updated document is returned
      (err, updatedUser) => {
        if (err){ //This will show an error if there is one
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser); //this returns the JSON of the updated user info
        }
      });
});

// This allows the user to add a movie to their list
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, { //This finds a user by name
    $push: {FavoriteMovies: req.params.MovieID} //This "pushes" a new favorite movie to their favorite movie list
  },
  {new: true}, //This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) { //This checks for errors
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser); //If there's no errors, this will return the updated info for the user in JSON format
    }
  });
});

// This allows the user to delete a movie from their list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, { //This finds a user by name
    $pull: {FavoriteMovies: req.params.MovieID} //This "pulls" a favorite movie from their favorite movie list
  },
  {new: true}, //This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) { //This checks for errors
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser); //If there's no errors, this will return the updated info for the user in JSON format
    }
  });
});

// This deregisters the user and deletes them from the database
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove({Username: req.params.Username}) //This finds the user by username and removes them from the user group
    .then((user) =>{
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found'); //If the username couldn't be found it'll send this error
      } else {
        res.status(500).send(req.params.Username + ' was deleted.'); //If the username was found it'll send this message
      }
    })
    .catch((err) => { //This catches errors
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// listen for requests
const port = process.env.PORT || 8080; //Looks for a pre-configured port number in the environment variable and if nothing is found sets the port to 8080
app.listen(port, '0.0.0.0', () => {
  console.log('Your app is listening on port' + port);
});
