const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [{
  "id": "testID",
  "name":"Fernando Santos",
  "username": "nandao",
  "todos": []
}];

function checksExistsUserAccount(request, response, next) {
  //checkExistsUserAccount
  const { username } = request.headers

  const user = users.find(user => user.username.toLowerCase() === username.toLowerCase())
  
  if (user == undefined) return response.status(404).send('Sorry, user not found! :(')

  request.user = user
  
  return next()
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

  response.send(newUser).status(200)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // GET todos
  const { user } = request
  
  response.send(user.todos).status(200)
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