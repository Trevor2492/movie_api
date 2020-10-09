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

// GET requests
app.get('/', (req, res) => {
  res.send('This is the default textual response page');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});
