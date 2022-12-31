const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  //checkExistsUserAccount
  const { username } = request.headers

  if (username == undefined || null) return response.status(404).json({ error : 'Sorry, username not found! :(' })

  const user = users.find(user => user.username.toLowerCase() === username.toLowerCase())
  
  if (user == undefined) return response.status(404).json({ error: 'Sorry, user not found! :(' })

  request.user = user
  
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const id = uuidv4()

  const usernameAlreadyExists = users.find(user => user.username.toLowerCase() === username.toLowerCase())

  if (usernameAlreadyExists) return response.status(400).json({ error : 'Sorry, username already exists :(' })

  const newUser = {
    id: id,
    name: name,
    username: username,
    todos: []
  }

  users.push(newUser)

  response.status(201).send(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // GET todos
  const { user } = request
  
  response.status(200).send(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
   //POST todos
  const { title, deadline } = request.body

  const {user} = request

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  response.status(201).send(newTodo)
  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // PUT todos
  const { user } = request,
  { id } = request.params,
  newTitle = request.body.title,
  newDeadline = request.body.deadline
  
  const editedToDo = user.todos.find(toDo => toDo.id === id)

  if (!editedToDo) { 
    return response.status(404).json({error : 'Sorry, To Do not found :('}) 
  }
  
  editedToDo.title = newTitle
  editedToDo.deadline = newDeadline
  
  response.status(200).send(editedToDo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // PATCH todos
  const { user } = request
  const { id } = request.params  

  const toDo = user.todos.find(toDo => toDo.id === id )

  if (!toDo) {
    return response.status(404).json({error : 'Sorry, To Do not found :('})
  }

  toDo.done = true

  response.send(toDo).status(200)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // DELETE todos
  const { user } = request
  const { id } = request.params

  const indexOftoDo = user.todos.findIndex(toDo => toDo.id === id)

  if (indexOftoDo == -1) return response.status(404).json({error : 'Sorry, To Do not found :('})

  user.todos.splice(indexOftoDo, 1)
  
  response.status(204).send(`To Do deleted sucessfully`)

});

module.exports = app;