const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const req = require('express/lib/request');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//Middleware
function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;
    const userExists = users.find(u => u.username == username)
    if (!userExists) {
        return response.status(400).json({
            error: 'usuário não existe'
        })
    }
    request.user = userExists
    next();
}


//Middleware
function checksExistsTodo(request, response, next) {
    const { id } = request.params;
    const { user} = request
    const todoIndex = user.todos.findIndex(t => t.id == id)
    if (todoIndex < 0) {
        return response.status(404).json({
            error: "Todo não existe"
        });
    }
    request.todoIndex = todoIndex
   

    next()
}

// Cadastrar usuário
app.post('/users', (request, response) => {
    const { name, username } = request.body; // desetruturação
    const userExists = users.find(u => u.username == username); // busca em array
    if (userExists) { // verificação de valor
        return response.status(400).json({ error: "erro: usuário já existe" }); // resposta de erro
    }
    const user = { name, username, id: uuidv4(), todos: [] }; // instanciação de objeto completo
    users.push(user); // salvamento( create) no array
    return response.status(201).json(user); // resposta de sucesson
}
);

// name, username
// ID, TODOS[]
// Se usuario com USERNAME existe THROW ERROR

// Recuperar TODOS
app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request
    return response.status(200).json(user.todos);
});

// Cadastrar um TODO
app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request
    const { title, deadline } = request.body;
    const todo = {
        id: uuidv4(),
        title,
        deadline: new Date(deadline),
        created_at: new Date(),
        done: false
    }
    user.todos.push(todo)
    return response.status(201).json(todo)
});

// Atualizar um TODO
app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
    const { user,  todoIndex } = request;
    const { title, deadline } = request.body;
    const updatedTodo = user.todos[todoIndex];
    updatedTodo.title = title;
    updatedTodo.deadline = deadline;
    user.todos[todoIndex] = updatedTodo;
    return response.status(200).json(updatedTodo);

});

// Corrigir um TODO
app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
    const { user, todoIndex } = request;
    const patched = user.todos[todoIndex];
    patched.done = true;
    return response.status(200).json(patched);
});

// Deletar um TODO
app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
    const { user,todoIndex } = request;
    user.todos.splice(todoIndex, 1);

    return response.status(204).json();
});

module.exports = app;