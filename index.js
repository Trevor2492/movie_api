const express = require('express'),
  morgan = require('morgan');

const app = express();

let topMovies = [
  {
    title: 'Ace Ventura: Pet Detective',
    leadActor: 'Jim Carrey'
  },
  {
    title: 'Nacho Libre',
    leadActor: 'Jack Black'
  },
  {
    title: 'Kung Pow: Enter the Fist',
    leadActor: 'Steve Oedekirk'
  },
  {
    title: 'Hot Rod',
    leadActor: 'Andy Samberg'
  },
  {
    title: 'Zombieland',
    leadActor: 'Jesse Eisenberg'
  },
  {
    title: 'Scott Pilgrim vs. the World',
    leadActor: 'Michael Cera'
  },
  {
    title: 'Thor: Ragnarok',
    leadActor: 'Chris Hemsworth'
  },
  {
    title: 'Ford vs. Ferrari',
    leadActor: 'Matt Damon'
  },
  {
    title: 'The Dark Knight',
    leadActor: 'Christian Bale'
  },
  {
    title: 'Inception',
    leadActor: 'Leonardo DiCaprio'
  }
];

app.use(morgan('common')); //When the user enters a url into the browser this logs a timestamp and the pathName to the console

app.use('/documentation', express.static('public')); //This should serve the "documentation.html" file to the browser

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
app.get('/movies', (req, res) => {
  res.json(topMovies)
});

// This shows the details for a movie based on the movie name
app.get('/movies/:title', (req, res) => {
  res.json(topMovies.find((movie) =>
  { return movie.title === req.params.title }));
});

// This shows information about a specific genre(description) by name/title
app.get('/movies/genres/genre', (req, res) => {
  res.send('This is where we will show more information about a specific genre');
});

// This shows information about a specific director by name
app.get('/movies/Directors/director', (req, res) => {
  res.send('This is where we will show more information about a specific Director');
});

// Registers a new user
app.post('/users', (req, res) => {
  res.send('This is where a new user will be able to register');
});

// This allows the user to update their info
app.put('/users/username', (req, res) => {
  res.send('This is where the user will be able to update their information');
});

// This allows the user to add a movie to their list
app.post('/users/username/movies/movieID', (req, res) => {
  res.send('This is where users can add a movie to their list of favorites');
});

// This allows the user to delete a movie from their list
app.delete('/users/username/movies/movieID', (req, res) => {
  res.send('This is where users will be able to delete a movie from their list');
});

// This deregisters the user
app.delete('/users/username', (req, res) => {
  res.send('This is where users will be able to deregister');
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});
