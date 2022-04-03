
const path = require('path');

const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { SocketAddress } = require('net');

const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'Chatbot';

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket=>{

    socket.on('joinroom', ({username, room})=>{

        const user = userJoin(socket.id, username, room);
        console.log(`${username} has joined`);


        socket.join(user.room);

        // Welcome new connected user.
        socket.emit('message', formatMessage(botName, 'Welcome to chatroom!') );

        // Broadcast when a user connection(everyone else in room except user who connected.)
        socket.broadcast
            .to(user.room)
            .emit('message',formatMessage(botName, `${user.username} has joined the chat`)
        );

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });


    });

   
    // Listening to user's messages and sending them respectively.
    socket.on('chatMessage', (message)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, message));
    });


    // When user disconnects
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);
        if(user){
            console.log(`${user.username} has left`);
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`) );
                    // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

    });

});


const PORT = process.env.PORT || 3005;
server.listen(PORT,'0.0.0.0',()=>{
    console.log('Server is up');
});


