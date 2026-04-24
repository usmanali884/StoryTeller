const API_KEY = "AIzaSyCGYDBGbSjQxRMxRRgpYNE_ZDjox62v2Nk";
let myRole = null;

// --- 1. ROLE SELECTION ---
// Using onclick directly in JS to ensure it catches the click
document.getElementById('claim-narrator').addEventListener('click', () => {
    myRole = 'narrator';
    document.getElementById('lobby-view').classList.add('hidden');
    document.getElementById('narrator-view').classList.remove('hidden');
    console.log("Role assigned: Narrator");
});

document.getElementById('claim-player').addEventListener('click', () => {
    myRole = 'player';
    document.getElementById('lobby-view').classList.add('hidden');
    document.getElementById('player-view').classList.remove('hidden');
    console.log("Role assigned: Player");
});

// --- 2. NARRATOR UPDATES GAME ---
document.getElementById('send-update').onclick = async () => {
    const story = document.getElementById('story-box').value;
    const hint = document.getElementById('image-hint').value;
    const options = Array.from(document.querySelectorAll('.btn-name'))
                         .map(i => i.value.trim()).filter(v => v !== "");

    if (options.length < 2) return alert("You need at least 2 options!");

    // UI Feedback
    const btn = document.getElementById('send-update');
    btn.innerText = "Generating...";
    btn.disabled = true;

    const imageUrl = await generateGeminiImage(hint);
    
    // Package data to send
    const gameState = { story, options, imageUrl, sender: 'narrator' };
    
    // FOR LOCAL TESTING: We call the receive function directly
    // In a real Discord bot, this would go through a server
    processGameUpdate(gameState);

    btn.innerText = "Update Game";
    btn.disabled = false;
};

// --- 3. THE HANDSHAKE (Processing Choices) ---
function processGameUpdate(data) {
    if (myRole === 'player' && data.sender === 'narrator') {
        // Player's screen updates with Narrator's story
        document.getElementById('story-display').innerText = data.story;
        const list = document.getElementById('options-list');
        list.innerHTML = "";
        
        data.options.forEach(text => {
            const b = document.createElement('button');
            b.className = "option-btn";
            b.innerText = text;
            b.onclick = () => playerMadeChoice(text);
            list.appendChild(b);
        });

        const img = document.getElementById('active-image');
        img.src = data.imageUrl;
        img.classList.remove('hidden');
        document.getElementById('scene-placeholder').classList.add('hidden');
    }

    if (myRole === 'narrator' && data.sender === 'player') {
        // Narrator sees the choice the player made
        const notify = document.createElement('div');
        notify.innerHTML = `<p style="color:#66fcf1; border-left: 3px solid; padding-left: 10px;">
                            <strong>Player chose:</strong> ${data.choice}</p>`;
        
        const panel = document.querySelector('.control-panel');
        panel.insertBefore(notify, document.getElementById('story-box'));
        
        // Clear the story box for the next part of the tale
        document.getElementById('story-box').value = "";
    }
}

function playerMadeChoice(choice) {
    console.log("Player clicked:", choice);
    const choiceUpdate = { choice, sender: 'player' };
    
    // Tell the Narrator what happened
    processGameUpdate(choiceUpdate);
    
    // Disable buttons so they can't click twice
    document.getElementById('options-list').innerHTML = "<em>Waiting for Narrator's next move...</em>";
}

async function generateGeminiImage(hint) {
    // Temporary high-quality placeholder logic
    return new Promise(resolve => {
        setTimeout(() => {
            const id = Math.floor(Math.random() * 1000);
            resolve(`https://picsum.photos/seed/${id}/1200/800?blur=2`);
        }, 1500);
    });
}