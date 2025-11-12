// ----------------------------------------------------------------
// 1. VARIABLES GLOBALES
// ----------------------------------------------------------------
const prompts = [
    "Una película de terror 👻",
    "Algo que comes en el desayuno 🍳",
    "Animales de la selva 🦁",
    "Lugares para ir de vacaciones 🏖️",
    "Algo que encuentras en el espacio 🚀",
    "Cosas que haces en invierno 🧣",
    "Instrumentos musicales 🎸",
    "Artículos de oficina 📎",
    "Personajes de cuentos de hadas 👑",
    "Marcas de coches 🚗"
];

let players = [];
let currentPlayerIndex = 0;
let roundResponses = [];
let timerInterval = null;
let currentRoundNumber = 0;
const TIME_LIMIT = 10; // Segundos
const MAX_ROUNDS = 3; // Número de rondas para terminar el juego

// Referencias a elementos del DOM
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const endScreen = document.getElementById('endScreen');
const playerCountInput = document.getElementById('playerCount');
const playerListDiv = document.getElementById('playerList');
const promptDiv = document.getElementById('prompt');
const currentPlayerSpan = document.getElementById('currentPlayer');
const timerDiv = document.getElementById('timer');
const emojiAnswerInput = document.getElementById('emojiAnswer');
const inputPhaseDiv = document.getElementById('inputPhase');
const boomPhaseDiv = document.getElementById('boomPhase');
const boomMessageDiv = document.getElementById('boomMessage');
const votingPhaseDiv = document.getElementById('votingPhase');
const answersDiv = document.getElementById('answers');
// ... (otras referencias DOM)
const nextPlayerButton = document.querySelector('#boomPhase .btn'); // <-- NUEVA LÍNEA
// ...

// ----------------------------------------------------------------
// 2. FUNCIONES DE CONTROL DE PANTALLA Y JUEGO
// ----------------------------------------------------------------

function startGame() {
    const count = parseInt(playerCountInput.value);
    if (count < 2 || count > 8 || isNaN(count)) {
        alert("¡Necesitas entre 2 y 8 jugadores para empezar!");
        return;
    }

    players = [];
    currentRoundNumber = 0;
    for (let i = 1; i <= count; i++) {
        players.push({
            name: `Jugador ${i}`,
            score: 0,
            id: i,
            isBoomed: false 
        });
    }
    
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    endScreen.classList.add('hidden');

    updatePlayerList();
    startNewRound();
}

function updatePlayerList() {
    playerListDiv.innerHTML = players.map(player => 
        `<div id="player-${player.id}" class="player-score">${player.name}: ${player.score} ⭐</div>`
    ).join('');
}

function startNewRound() {
    if (currentRoundNumber >= MAX_ROUNDS) {
        endGame();
        return;
    }
    
    currentRoundNumber++;
    
    roundResponses = [];
    currentPlayerIndex = 0;

    // Limpiar estado y estilos de jugadores
    players.forEach(p => {
        p.isBoomed = false;
        const element = document.getElementById(`player-${p.id}`);
        if (element) {
            element.classList.remove('winner');
            element.style.backgroundColor = '';
            element.style.color = '';
        }
    });
    
    // Elegir un prompt al azar
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    promptDiv.textContent = `Ronda ${currentRoundNumber}/${MAX_ROUNDS}: Pista: ${randomPrompt}`;
    
    // Mostrar fase de entrada
    boomPhaseDiv.classList.add('hidden');
    votingPhaseDiv.classList.add('hidden');
    inputPhaseDiv.classList.remove('hidden');
    
    startPlayerTurn(currentPlayerIndex);
}

function startPlayerTurn(index) {
    let turnsChecked = 0;
    let nextIndex = index;
    
    // ... (código para encontrar el siguiente jugador) ...

    const nonBoomedCount = players.filter(p => !p.isBoomed).length;
    if (roundResponses.length >= nonBoomedCount) {
        startVotingPhase();
        return;
    }

    currentPlayerIndex = nextIndex;
    const player = players[currentPlayerIndex];

    // 1. Limpiar y mostrar el jugador
    currentPlayerSpan.textContent = player.name;
    emojiAnswerInput.value = '';

    // 🔥 ELIMINAR O COMENTAR la línea emojiAnswerInput.focus();
    // emojiAnswerInput.focus(); 

    // 2. Iniciar el temporizador al final
    startTimer();
}
// ----------------------------------------------------------------
// 3. LÓGICA DEL TEMPORIZADOR Y LA BOMBA
// ----------------------------------------------------------------

function startTimer() {
    clearInterval(timerInterval);
    let timeLeft = TIME_LIMIT;
    timerDiv.textContent = timeLeft;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDiv.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimerEnd(); // ¡KABOOM!
        }
    }, 1000);
}

function handleTimerEnd() {
    inputPhaseDiv.classList.add('hidden');
    boomPhaseDiv.classList.remove('hidden');
    
    // ✅ NUEVO: Referenciamos el botón justo aquí.
    const nextPlayerButton = document.querySelector('#boomPhase .btn'); 
    
    // 1. Ocultar el botón inmediatamente para el retraso
    nextPlayerButton.classList.add('hidden'); 
    
    const player = players[currentPlayerIndex];
    player.isBoomed = true;
    
    boomMessageDiv.innerHTML = `¡Oh no, **${player.name}** explotó! 💥<br>Su respuesta (si la hubo) no se cuenta.`;
    
    // ... (código para resaltar el jugador) ...
    
    // 2. Mostrar el botón "Siguiente" después de 2 segundos
    setTimeout(() => {
        nextPlayerButton.classList.remove('hidden'); 
    }, 2000); // 2000 milisegundos = 2 segundos
    
    const activePlayersCount = players.filter(p => !p.isBoomed).length;
    if (activePlayersCount <= 1) {
        setTimeout(nextPlayerAfterBoom, 2000);
    }
}

// Listener para pasar la bomba (colocado al cargar el script)
// NUEVO CÓDIGO: Pasa la bomba SOLO cuando el jugador presiona Enter
emojiAnswerInput.addEventListener('keydown', (event) => {
    // Código 13 es la tecla Enter
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault(); // Evita el salto de línea por defecto
        
        // Asegurarse de que haya al menos 1 carácter (o 1 emoji)
        if (emojiAnswerInput.value.length >= 1) {
            clearInterval(timerInterval);
            passTheBomb(emojiAnswerInput.value);
        }
    }
});

function passTheBomb(answer) {
    const player = players[currentPlayerIndex];
    
    roundResponses.push({
        playerId: player.id,
        playerName: player.name,
        answer: answer,
        starVotes: 0
    });

    emojiAnswerInput.value = ''; 

    let nextIndex = (currentPlayerIndex + 1) % players.length;
    startPlayerTurn(nextIndex);
}

function nextPlayerAfterBoom() {
    const nonBoomedCount = players.filter(p => !p.isBoomed).length;

    if (roundResponses.length >= nonBoomedCount) {
        startVotingPhase();
        return;
    }

    boomPhaseDiv.classList.add('hidden');
    inputPhaseDiv.classList.remove('hidden');

    let nextIndex = (currentPlayerIndex + 1) % players.length;
    startPlayerTurn(nextIndex);
}

// ----------------------------------------------------------------
// 4. FASE DE VOTACIÓN Y PUNTUACIÓN
// ----------------------------------------------------------------

function startVotingPhase() {
    inputPhaseDiv.classList.add('hidden');
    boomPhaseDiv.classList.add('hidden');
    
    votingPhaseDiv.classList.remove('hidden');

    answersDiv.innerHTML = roundResponses.map((res, index) => `
        <div class="card" style="margin-bottom: 20px;">
            <p style="font-size: 1.2rem;">**${res.playerName}** dice:</p>
            <div class="emoji-input">${res.answer}</div>
            <div class="stars" id="stars-${index}">
                ${[1, 2, 3, 4, 5].map(star => 
                    `<span data-index="${index}" data-rating="${star}" onclick="handleStarClick(this)">⭐</span>`
                ).join('')}
            </div>
        </div>
    `).join('');
}

window.handleStarClick = function(element) {
    const answerIndex = element.getAttribute('data-index');
    const rating = parseInt(element.getAttribute('data-rating'));
    const starContainer = document.getElementById(`stars-${answerIndex}`);
    
    Array.from(starContainer.children).forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= rating) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
    
    roundResponses[answerIndex].starVotes = rating;
};

function endRound() {
    let maxScore = -1;
    let winners = [];

    roundResponses.forEach(res => {
        if (res.starVotes > maxScore) {
            maxScore = res.starVotes;
            winners = [res.playerId];
        } else if (res.starVotes === maxScore && maxScore > 0) {
            winners.push(res.playerId);
        }
    });

    let winnerNames = [];
    if (maxScore > 0) {
        players.forEach(player => {
            if (winners.includes(player.id)) {
                player.score += 1;
                winnerNames.push(player.name);
            }
        });
    }
    
    updatePlayerList();
    
    alert(`¡Ronda ${currentRoundNumber} terminada! Ganadores: ${winnerNames.join(' y ')} (con ${maxScore} estrellas).`);
    
    winners.forEach(id => {
        const winnerElement = document.getElementById(`player-${id}`);
        if (winnerElement) {
            winnerElement.classList.add('winner');
        }
    });

    setTimeout(startNewRound, 4000); 
}

// ----------------------------------------------------------------
// 5. FIN DEL JUEGO
// ----------------------------------------------------------------

function endGame() {
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    
    let maxScore = -1;
    let finalWinners = [];
    
    players.forEach(player => {
        if (player.score > maxScore) {
            maxScore = player.score;
            finalWinners = [player];
        } else if (player.score === maxScore) {
            finalWinners.push(player);
        }
    });

    if (finalWinners.length === 1) {
        endScreen.innerHTML = `<h2>¡FIN DEL JUEGO! 🏆</h2>
            <p style="font-size:2.5rem; color: var(--gold);">El ganador es: **${finalWinners[0].name}** con ${maxScore} puntos.</p>
            <p style="font-size:1.5rem;">¡Felicidades!</p>
            <button class="btn" onclick="window.location.reload()">Jugar de Nuevo</button>`;
    } else {
         endScreen.innerHTML = `<h2>¡FIN DEL JUEGO! 🤝</h2>
            <p style="font-size:2.5rem; color: #48dbfb;">¡Es un empate!</p>
            <p style="font-size:1.5rem;">Ganadores: **${finalWinners.map(w => w.name).join(' y ')}** con ${maxScore} puntos.</p>
            <button class="btn" onclick="window.location.reload()">Jugar de Nuevo</button>`;
    }
}

// ----------------------------------------------------------------
// 6. ASIGNACIÓN DE FUNCIÓN GLOBAL
// ----------------------------------------------------------------
window.startGame = startGame;
window.nextPlayerAfterBoom = nextPlayerAfterBoom;
window.endRound = endRound;