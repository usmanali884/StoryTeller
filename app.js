// --- CONFIGURATION ---
const API_KEY = "AIzaSyCGYDBGbSjQxRMxRRgpYNE_ZDjox62v2Nk";
// Note: For a true multiplayer Discord experience, you'll eventually 
// connect this to a Socket.io server URL.
const socket = {
    emit: (event, data) => console.log(`Sending ${event}:`, data),
    on: (event, callback) => console.log(`Listening for ${event}`)
};

let myRole = null;

// --- ROLE SELECTION ---
document.getElementById('claim-narrator').onclick = () => {
    myRole = 'narrator';
    document.getElementById('lobby-view').classList.add('hidden');
    document.getElementById('narrator-view').classList.remove('hidden');
};

document.getElementById('claim-player').onclick = () => {
    myRole = 'player';
    document.getElementById('lobby-view').classList.add('hidden');
    document.getElementById('player-view').classList.remove('hidden');
};

// --- NARRATOR ACTIONS ---
document.getElementById('send-update').onclick = async () => {
    const story = document.getElementById('story-box').value;
    const prompt = document.getElementById('image-hint').value;
    
    // Get all 5 inputs, but filter out the empty ones
    const btnInputs = Array.from(document.querySelectorAll('.btn-name'));
    const options = btnInputs.map(i => i.value.trim()).filter(v => v !== "");

    if (options.length < 2) {
        alert("Please provide at least 2 options for the player!");
        return;
    }

    // Update UI to show loading
    const btn = document.getElementById('send-update');
    btn.innerText = "Generating Vision...";
    btn.disabled = true;

    try {
        const imageUrl = await generateGeminiImage(prompt);
        
        const gameData = { story, options, imageUrl };
        
        // This is where you'd send to the other player via your server
        // For testing locally, we'll just call the update function directly
        updatePlayerUI(gameData);
        
        btn.innerText = "Update Game";
        btn.disabled = false;
        alert("Story pushed to Player!");
    } catch (err) {
        console.error(err);
        btn.innerText = "Error - Try Again";
        btn.disabled = false;
    }
};

// --- SHARED FUNCTIONS ---
function updatePlayerUI(data) {
    // Update Story Text
    document.getElementById('story-display').innerText = data.story;
    
    // Update Buttons (Clears old ones first)
    const list = document.getElementById('options-list');
    list.innerHTML = "";
    
    data.options.forEach(text => {
        const b = document.createElement('button');
        b.className = "option-btn";
        b.innerText = text;
        b.onclick = () => alert(`Player chose: ${text}`);
        list.appendChild(b);
    });

    // Update Image
    const img = document.getElementById('active-image');
    const placeholder = document.getElementById('scene-placeholder');
    
    if (data.imageUrl) {
        img.src = data.imageUrl;
        img.onload = () => {
            img.classList.remove('hidden');
            placeholder.classList.add('hidden');
        };
    }
}

async function generateGeminiImage(hint) {
    console.log("Calling Gemini 3 Flash Image for:", hint);
    // This currently uses a high-quality placeholder. 
    // To make the API work, you'll need to fetch from the Google AI endpoint.
    return new Promise((resolve) => {
        setTimeout(() => {
            // Using a dynamic placeholder that changes based on keywords in the hint
            const randomID = Math.floor(Math.random() * 1000);
            resolve(`https://picsum.photos/seed/${randomID}/1200/800?grayscale`);
        }, 2000);
    });
}