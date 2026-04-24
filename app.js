const socket = io(); // Initialize socket connection
let myRole = null;

// --- ROLE SELECTION ---
socket.on('role_update', (roles) => {
    const nBtn = document.getElementById('claim-narrator');
    const pBtn = document.getElementById('claim-player');

    // Disable buttons if role is taken
    nBtn.disabled = !!roles.narrator;
    nBtn.innerText = roles.narrator ? "Narrator Taken" : "Be the Narrator";
    
    pBtn.disabled = !!roles.player;
    pBtn.innerText = roles.player ? "Player Taken" : "Be the Player";
});

document.getElementById('claim-narrator').onclick = () => {
    socket.emit('claim_role', 'narrator');
    myRole = 'narrator';
    document.getElementById('lobby-view').classList.add('hidden');
    document.getElementById('narrator-view').classList.remove('hidden');
};

document.getElementById('claim-player').onclick = () => {
    socket.emit('claim_role', 'player');
    myRole = 'player';
    document.getElementById('lobby-view').classList.add('hidden');
    document.getElementById('player-view').classList.remove('hidden');
};

// --- NARRATOR SENDING DATA ---
document.getElementById('send-update').onclick = async () => {
    const story = document.getElementById('story-box').value;
    const hint = document.getElementById('image-hint').value;
    const options = Array.from(document.querySelectorAll('.btn-name'))
                         .map(i => i.value).filter(v => v);

    // Show local "Loading" state
    console.log("Generating visual via Gemini...");
    
    // In a real Discord app, you'd call your backend here to hide the API Key
    const imageUrl = await generateGeminiImage(hint);

    const gameData = { story, options, imageUrl };
    socket.emit('send_story_update', gameData);
};

// --- PLAYER RECEIVING DATA ---
socket.on('receive_story_update', (data) => {
    if (myRole !== 'player') return;

    document.getElementById('story-display').innerText = data.story;
    
    const list = document.getElementById('options-list');
    list.innerHTML = "";
    data.options.forEach(opt => {
        const b = document.createElement('button');
        b.className = "option-btn";
        b.innerText = opt;
        list.appendChild(b);
    });

    const img = document.getElementById('active-image');
    const placeholder = document.getElementById('scene-placeholder');
    
    if (data.imageUrl) {
        img.src = data.imageUrl;
        img.classList.remove('hidden');
        placeholder.classList.add('hidden');
    }
});

async function generateGeminiImage(prompt) {
    // This function will eventually hit your /generate-image backend route
    // which uses the Gemini 3 Flash Image model to create the stylized art.
    return "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800"; 
}