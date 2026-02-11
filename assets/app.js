/**
 * Main Application Logic
 * Handles state management, input validation, and UI updates.
 */

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

const CONSTANTS = {
    STORAGE_KEY: 'bday_game_progress',
    TOKEN_PREFIX: 'ok=STAGE'
};

function initApp() {
    // Determine which page we are on
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');

    // Load state
    const state = loadState();

    // Setup global UI elements
    setupGlobalControls();

    if (page === 'index' || page === '' || path.endsWith('/')) {
        handleIndexPage(state);
    } else if (page === 'finish') {
        handleFinishPage(state);
    } else {
        // Assume stage page
        // Try to parse stage number from filename "1.html" -> 1
        const stageNum = parseInt(page);
        if (!isNaN(stageNum)) {
            handleStagePage(stageNum, state);
        }
    }
}

/* --- State Management --- */

function loadState() {
    const raw = localStorage.getItem(CONSTANTS.STORAGE_KEY);
    if (!raw) return { maxStage: 1, currentStage: 1 };
    return JSON.parse(raw);
}

function saveState(state) {
    localStorage.setItem(CONSTANTS.STORAGE_KEY, JSON.stringify(state));
}

function resetGame() {
    if (confirm('האם אתם בטוחים שברצונכם לאפס את המשחק?')) {
        localStorage.removeItem(CONSTANTS.STORAGE_KEY);
        window.location.href = getBasePath() + 'index.html';
    }
}

/* --- Page Handlers --- */

function handleIndexPage(state) {
    const startBtn = document.getElementById('start-btn');
    const welcomeText = document.getElementById('welcome-text');
    const welcomeImage = document.getElementById('welcome-image');

    // 1. Set Defaults from Config
    document.getElementById('game-title').textContent = GAME_CONFIG.title;
    document.getElementById('game-subtitle').textContent = GAME_CONFIG.gameTitle;
    welcomeText.textContent = GAME_CONFIG.welcomeText;
    if (welcomeImage) welcomeImage.src = GAME_CONFIG.welcomeImage;

    // 2. Handle State (Returning User)
    if (state.maxStage > 1) {
        startBtn.textContent = 'המשך במשחק (שלב ' + state.maxStage + ')';
        welcomeText.textContent = 'ברוכים השבים! מוכנים להמשיך?';
        startBtn.onclick = () => {
            window.location.href = `${getBasePath()}stage/${state.maxStage}.html#${generateToken(state.maxStage)}`;
        };
    } else {
        startBtn.onclick = () => {
            // New game
            window.location.href = `${getBasePath()}stage/1.html`;
        };
    }
}

function handleStagePage(stageNum, state) {
    // 1. Security / Logic Check
    // User must have reached this stage in localStorage OR provided a valid hash token from previous stage
    // Exception: Stage 1 is always open

    const stageConfig = GAME_CONFIG.stages.find(s => s.id === stageNum);
    if (!stageConfig) {
        document.body.innerHTML = '<h1>שגיאה: שלב לא נמצא</h1><a href="../index.html" class="btn">חזור להתחלה</a>';
        return;
    }

    // Verify access
    // If we are at stage N, we expect to be allowed if maxStage >= N
    // OR if the URL has the correct token from N-1 (but simple localStorage check is usually enough for this UX)

    /* 
       Strict mode: check hash token from previous stage. 
       Stage 1 needs no token.
       Stage N needs token of Stage N-1? 
       Actually user requested: "if user enters correct code, redirect to next page with hash token... verify previous stage token exists"
       
       Let's implement:
       Check if we are allowed.
       Allowed if: Stage == 1 OR (Hash contains "ok=STAGE{N}" where N == Stage) OR (localStorage says we reached this stage)
    */

    const expectedToken = generateToken(stageNum);
    const hash = window.location.hash.substring(1); // remove #
    const isHashValid = hash === expectedToken;
    const isStorageValid = state.maxStage >= stageNum;

    if (stageNum > 1 && !isHashValid && !isStorageValid) {
        document.body.innerHTML = `
            <div class="container" style="text-align:center">
                <h1>אופס!</h1>
                <p>נראה שעדיין לא סיימתם את השלב הקודם.</p>
                <a href="1.html" class="btn">התחל מההתחלה</a>
                <br><br>
                <a href="${stageNum - 1}.html" class="btn btn-secondary">חזור לשלב הקודם</a>
            </div>
        `;
        return;
    }

    // Update maxStage if we legitimately reached here
    if (state.maxStage < stageNum) {
        state.maxStage = stageNum;
        saveState(state);
    }

    // 2. Render Content
    document.title = stageConfig.title;
    document.getElementById('stage-title').textContent = stageConfig.title;
    document.getElementById('stage-story').textContent = stageConfig.story;
    document.getElementById('stage-image').src = stageConfig.image;
    document.getElementById('stage-image').alt = stageConfig.title;
    document.getElementById('progress-indicator').textContent = `שלב ${stageNum} מתוך ${GAME_CONFIG.stages.length}`; // Fixed to static length or config length

    // 3. Setup Logic
    setupHints(stageConfig.hints);
    setupValidation(stageConfig, stageNum);
}

function handleFinishPage(state) {
    document.title = GAME_CONFIG.finishTitle;
    document.getElementById('finish-title').textContent = GAME_CONFIG.finishTitle;
    document.getElementById('finish-body').textContent = GAME_CONFIG.finishBody;
    document.getElementById('prize-text').textContent = GAME_CONFIG.finalPrizeText;
    document.getElementById('finish-footer').textContent = GAME_CONFIG.finishFooter;

    // Validate they actually finished
    if (state.maxStage < GAME_CONFIG.stages.length) {
        // Maybe let them stay but show a generic message? Or redirect logic.
        // For fun, we let it slide or just check.
    }

    startConfetti();
}

/* --- Helpers --- */

function setupGlobalControls() {
    // Reset button logic
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetGame();
        });
    }
}

function setupHints(hints) {
    const hintBtn = document.getElementById('hint-btn');
    const hintsContainer = document.getElementById('hints-container');
    let hintsShown = 0;

    if (!hints || hints.length === 0) {
        hintBtn.style.display = 'none';
        return;
    }

    hintBtn.addEventListener('click', () => {
        if (hintsShown < hints.length) {
            const hint = hints[hintsShown];
            const p = document.createElement('p');
            p.className = 'hint-box';
            p.textContent = `רמז ${hintsShown + 1}: ${hint}`;
            hintsContainer.appendChild(p);

            // Trigger reflow for animation
            setTimeout(() => p.classList.add('visible'), 10);

            hintsShown++;

            if (hintsShown >= hints.length) {
                hintBtn.textContent = 'אין עוד רמזים';
                hintBtn.disabled = true;
                hintBtn.classList.add('btn-secondary');
            }
        }
    });
}

function setupValidation(stageConfig, stageNum) {
    const submitBtn = document.getElementById('submit-code');
    const input = document.getElementById('code-input');
    const feedback = document.getElementById('feedback');

    const validate = () => {
        const val = input.value.trim();
        if (val === stageConfig.correctCode) {
            // SUCCESS
            feedback.textContent = 'כל הכבוד! התשובה נכונה.';
            feedback.className = 'feedback success';
            input.disabled = true;
            submitBtn.disabled = true;

            // Show confetti
            startConfetti();

            // Show continue button
            const nextStage = stageNum + 1;
            const container = document.querySelector('.container');
            const nextBtn = document.createElement('a');
            nextBtn.className = 'btn';
            nextBtn.style.marginTop = '2rem';
            nextBtn.textContent = 'המשך לשלב הבא';

            // Logic for next link
            if (stageNum >= GAME_CONFIG.stages.length) {
                // Go to finish
                nextBtn.href = '../finish.html';
            } else {
                // Go to next stage with token
                const token = generateToken(nextStage);
                nextBtn.href = `${nextStage}.html#${token}`;
            }

            container.appendChild(nextBtn);
            nextBtn.focus();

        } else {
            // ERROR
            feedback.textContent = 'אופס, נסו שוב...';
            feedback.className = 'feedback error';
            input.value = '';
            input.focus();

            // Clear error style after animation
            setTimeout(() => {
                feedback.className = 'feedback';
            }, 2000);
        }
    };

    submitBtn.addEventListener('click', validate);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') validate();
    });
}

function generateToken(stageNum) {
    // Simple mock token: ok=STAGE{N}
    return `${CONSTANTS.TOKEN_PREFIX}${stageNum}`;
}

function startConfetti() {
    // Check for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Simple confetti using canvas or DOM elements?
    // Let's use a very simple CSS/DOM implementation to keep it dependency-free as requested (Vanilla JS)

    const count = 50;
    const colors = ['#ffb7b2', '#98ddca', '#8ac6d1', '#e2f0cb'];

    for (let i = 0; i < count; i++) {
        const conf = document.createElement('div');
        conf.style.position = 'fixed';
        conf.style.zIndex = '9999';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-10px';
        conf.style.width = '10px';
        conf.style.height = '10px';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.transition = `top ${1 + Math.random() * 2}s linear, transform 2s ease-in-out`;
        conf.style.transform = `rotate(${Math.random() * 360}deg)`;

        document.body.appendChild(conf);

        // Animate
        setTimeout(() => {
            conf.style.top = '110vh';
            conf.style.transform = `rotate(${Math.random() * 360 + 360}deg)`;
        }, 100);

        // Cleanup
        setTimeout(() => {
            conf.remove();
        }, 3000);
    }
}

function getBasePath() {
    // Determine base path based on depth
    // If we are in /stage/, we need ../
    const path = window.location.pathname;
    if (path.includes('/stage/')) return '../';
    return './';
}

