const http = require('http');
const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');

const app = express();
const port = process.env.PORT || 4500;

const users = [{}];

app.use(cors());
app.get('/', (req, res) => { res.send('Server is up and running.') });

//create a server
const server = http.createServer(app);

//create a socket for the server
const io = socketio(server);

//listen for a connection
io.on('connection', (socket) => {

    console.log('new connection!');

    // listen for an event from client
    socket.on('joined', (data) => {

        users[socket.id] = data.user;
        console.log(`${data.user} joined the chat`);

        //send data to all clients except the one who sent the data
        socket.broadcast.emit('userJoined', { user: "Admin", message: `${users[socket.id]} has joined!` });

        //send data to all clients
        socket.emit('welcome', { user: "Admin", message: `Welcome ${users[socket.id]}!` });
    })

    socket.on('message', ({ message, id }) => {
        console.log(`${users[id]}: ${message}`);
        io.emit('sendMessage', { user: users[id], message, id });
    });

    socket.on('disconnect', () => {
        console.log(`${users[socket.id]} left!`);
        //send data to all clients except the one who sent the data
        socket.broadcast.emit('leave', { user: "Admin", message: `${users[socket.id]} has left!` });
    });

});

server.listen(port, () => console.log(`Server has started on http://localhost:${port}/`));