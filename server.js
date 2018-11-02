'use strict'

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const methodoverride = require('method-override')

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));

const app = express();
app.use(cors());

app.use(express.static('public'));
app.set('view engine','ejs');

// ======================
app.use(express.urlencoded({extended:true}));
app.use(methodoverride((req, res) => {
  if(typeof(req.body) === 'object' && '_method' in req.body) {
    let method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.post('/', renderHome);
app.get('/', renderHome);
app.get('/search', newSearch);
app.post('/searches', searchBooks);
app.post('/save', saveBook);
app.get('/detail/:id', detailView)
app.post('/change-detail/:id', changedDetail)

app.listen(PORT, () => console.log(`App is up on ${PORT}`));

function newSearch(request, response) {
  response.render('pages/searches');
}

function changedDetail (request, response) {
  const SQL = `UPDATE books SET title=$1, author=$2, isbn=$3, description=$4, bookshelf=$5 WHERE id=${request.params.id};`;
  const values = request.body.edits;
  console.log(values);
  client.query(SQL, values)
    .then(result => {
      response.render('pages/books/detail', {item: result.row[0]})
    })
}

function detailView (request,response) {
  const SQL = `SELECT * FROM books WHERE id=$1;`;
  const values = [request.params.id];
  client.query(SQL,values)
    .then(result => {
      response.render('pages/books/detail', {item: result.rows[0]})
    })

}

function saveBook (request, response) {
  const SQL = `INSERT INTO books (title, author, image_url, isbn, description) VALUES($1,$2,$3,$4,$5) RETURNING id;`;
  const values = Object.values(request.body);
  client.query(SQL,values)
    .then(()=>{
      response.redirect('/');
    })
}

function renderHome (request, response){
  const SQL = `SELECT * FROM books;`;
  client.query(SQL)
    .then(result => {
      response.render('pages/searches/show', {items: result.rows});
    })
}

function Book (data) {
  this.id = data.id;
  this.author = data.volumeInfo.authors;
  this.title = data.volumeInfo.title;
  this.image_url = data.volumeInfo.imageLinks.thumbnail;
  this.description = data.volumeInfo.description;
  this.isbn = `${data.volumeInfo.industryIdentifiers[0].type}: ${data.volumeInfo.industryIdentifiers[0].identifier}`;
}

function searchBooks (request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q='

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`;}
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`;}
  superagent.get(url)
    .then(data => {
      return data.body.items.map(results => new Book(results))})
    .then(results => {
      return response.render('pages/searches/show', {items: results})
    })
    //TODO: error catch
}




