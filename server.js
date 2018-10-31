'use strict'

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
// const pg = require('pg');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());

app.use(express.static('public'));

app.set('view engine','ejs');

app.get('/', newSearch);
app.use(express.urlencoded({extended:true}));

app.post('/searches', searchBooks);

app.listen(PORT, () => console.log(`App is up on ${PORT}`));
app.get('/', (req,res) => {
  res.render('pages/index');
})

function newSearch(request, response) {
  response.render('pages/index');
}

function Book (data) {
  this.author = data.authors;
  this.title = data.title;
  this.image_url = data.imageLinks.thumbnail;
  this.description = data.description;
  this.isbn = `${data.industryIdentifiers[0].type}: ${data.industryIdentifiers[0].identifier}`;
}

function searchBooks (request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q='

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`;}
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`;}
  superagent.get(url)
    .then(data => {
    //   console.log(data.body.items);
      return data.body.items.map(results => new Book(results.volumeInfo))})
    .then(results => {
      console.log('results', results);
      return response.render('pages/searches/show', {items: results})
    })
    // .catch(response.render('pages/error'));
}




