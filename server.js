const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let roles = { narrator: null, player: null };

io.on('connection', (socket) => {
    // Send current role status to new joiners
    socket.emit('role_update', roles);

    socket.on('claim_role', (role) => {
        if (!roles[role]) {
            roles[role] = socket.id;
            io.emit('role_update', roles);
        }
    });

    // Broadcast story and images from Narrator to Player
    socket.on('send_story_update', (data) => {
        socket.broadcast.emit('receive_story_update', data);
    });

    socket.on('disconnect', () => {
        if (roles.narrator === socket.id) roles.narrator = null;
        if (roles.player === socket.id) roles.player = null;
        io.emit('role_update', roles);
    });
});

http.listen(3000, () => console.log('Server running on port 3000'));