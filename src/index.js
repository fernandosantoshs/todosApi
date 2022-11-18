const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  //checkExistsUserAccount
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const id = uuidv4()

  const newUser = {
    id: id,
    name: name,
    username: username,
    todos: []
  }

  users.push(newUser)
  //console.log(users)

  response.send(newUser).status(200)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // GET todos
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // POST todos
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // PUT todos
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // PATCH todos
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // DELETE todos
});

module.exports = app;