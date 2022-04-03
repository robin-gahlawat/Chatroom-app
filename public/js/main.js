

 
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// below Qs(querystring) library is accessible from cdn used in chat.html
const {username, room} = Qs.parse(location.search, {
   ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinroom', {username,room});

// Get room and users
socket.on('roomUsers', ({room, users})=>{
   outputRoomName(room);
   outputUsers(users);
})


// Sending message to server.
chatForm.addEventListener('submit', (e)=>{
   e.preventDefault();
   
   const message = e.target.elements.msg.value;
   socket.emit('chatMessage', message);

   // clear input box
   e.target.elements.msg.value = '';
   e.target.elements.msg.focus();
})


// Receiving messages from server.
socket.on('message', message=>{
   outputMessage(message);
   //Scroll down chat message div
   chatMessages.scrollTop = chatMessages.scrollHeight; 
})


// Sending message to DOM
function outputMessage(message){

   const d = new Date();
   const time = d.getHours() + ':'+ d.getMinutes();

   const div = document.createElement('div');
   div.classList.add('message');
   div.innerHTML = ` 
   <p class="meta"> ${message.username} <span>${time}</span></p>
   <p> ${message.text} </p>
   `;

   document.querySelector('.chat-messages').append(div);
}

// Sending room name to DOM
function outputRoomName(room){
   roomName.innerText = room;
};


// Sending user list to DOM
function outputUsers(users){
   userList.innerHTML = `
   ${users.map(user=>`<li>${user.username}</li>`).join('') }
   `;
};
