const express = require("express");
const cors = require("cors");
const { v4: uuidv4, validate } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!username) {
    return response.status(404).json({ error: "Username não encontrado :(" });
  }

  const user = users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );

  if (!user) {
    return response.status(404).json({ error: "Usuário não encontrado :(" });
  }

  request.user = user;

  return next();
}

function checksCreateTodosUserAvailability(request, response, next) {
  const { user } = request;

  if ((!user.pro && user.todos.length < 10) || user.pro) {
    return next();
  }

  return response
    .status(403)
    .send("Contrate o plano PRO para adicionar mais de 10 to-dos");
}

function checksTodoExists(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );

  const isValidId = validate(id);

  const todoExists = user.todos.find((todo) => todo.id === id);

  if (!user) {
    return response.status(404).json({ error: "Username inválido" });
  }

  if (!isValidId) {
    return response.status(404).json({ error: "Id inválido" });
  }

  if (user && isValidId && todoExists) {
    request.user = user;
    request.todo = todoExists;
    return next();
  }

  return response.status(404).json({ error: "To-do inválido" });
}

function findUserById(request, response, next) {
  const { id } = request.params;

  const userById = users.find((user) => user.id === id);

  if (userById) {
    request.user = userById;
    return next();
  }

  return response.status(404).send("User não encontrado");
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const id = uuidv4();

  const usernameAlreadyExists = users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );

  if (usernameAlreadyExists) {
    return response
      .status(400)
      .json({ error: "Desculpe, username já existente :(" });
  }

  const newUser = {
    id: id,
    name: name,
    username: username,
    todos: [],
  };

  users.push(newUser);

  response.status(201).send(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.status(200).send(user.todos);
});

app.post(
  "/todos",
  checksExistsUserAccount,
  checksCreateTodosUserAvailability,
  (request, response) => {
    const { title, deadline } = request.body;
    const { user } = request;

    const newTodo = {
      id: uuidv4(),
      title: title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date(),
    };

    user.todos.push(newTodo);

    response.status(201).send(newTodo);
  }
);

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksTodoExists,
  (request, response) => {
    const { todo } = request,
      { title, deadline } = request.body;

    todo.title = title;
    todo.deadline = deadline;

    response.status(200).send(todo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checksTodoExists,
  (request, response) => {
    const { todo } = request;

    todo.done = true;

    response.status(200).send(todo);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checksTodoExists,
  (request, response) => {
    const { user, todo } = request;

    const indexOftoDo = user.todos.findIndex((toDo) => toDo.id === todo.id);

    if (indexOftoDo == -1) {
      return response
        .status(404)
        .json({ error: "Desculpe, To Do não encontrado :(" });
    }

    user.todos.splice(indexOftoDo, 1);

    response.status(204).send(`To Do deletado com sucesso`);
  }
);

module.exports = app;
