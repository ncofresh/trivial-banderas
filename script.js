// --- ELEMENTOS DEL DOM ---
const langSelectorContainer = document.getElementById('language-selector-container');
const langButtons = document.querySelectorAll('.lang-btn');
const gameContainer = document.getElementById('game-container');
const resultsContainer = document.getElementById('results-container');
const flagImg = document.getElementById('flag-img');
const optionsContainer = document.getElementById('options-container');
const progressText = document.getElementById('progress-text');
const feedbackText = document.getElementById('feedback-text');
const finalScoreText = document.getElementById('final-score-text');
const playAgainBtn = document.getElementById('play-again-btn');
const loader = document.getElementById('loader');

// --- VARIABLES DEL JUEGO ---
// MODIFICADO: Se añade 'translations' para obtener los nombres en otros idiomas
const API_URL = 'https://restcountries.com/v3.1/all?fields=name,flags,translations';
const TOTAL_QUESTIONS = 10;
let countries = [];
let currentQuestionIndex = 0;
let score = 0;
let quizCountries = [];
let selectedLanguage = 'es'; // 'es' para español, 'en' para inglés

// --- DICCIONARIO DE TEXTOS ---
const UI_TEXT = {
    es: {
        gameTitle: "Adivina la Bandera",
        progress: (current, total) => `Intento ${current} de ${total}`,
        correct: "¡Correcto!",
        incorrect: (country) => `Incorrecto. La respuesta era ${country}.`,
        resultsTitle: "¡Juego Terminado!",
        finalScore: (score, total) => `Has acertado ${score} de ${total}`,
        playAgain: "Jugar de Nuevo",
        loading: "Cargando..."
    },
    en: {
        gameTitle: "Guess the Flag",
        progress: (current, total) => `Attempt ${current} of ${total}`,
        correct: "Correct!",
        incorrect: (country) => `Incorrect. The answer was ${country}.`,
        resultsTitle: "Game Over!",
        finalScore: (score, total) => `You scored ${score} out of ${total}`,
        playAgain: "Play Again",
        loading: "Loading..."
    }
};

// --- FUNCIONES ---

// 1. Obtener los datos de los países desde la API
async function fetchCountries() {
    try {
        loader.textContent = UI_TEXT[selectedLanguage].loading;
        loader.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('No se pudo cargar la información.');
        const data = await response.json();
        countries = data.filter(country => country.name.common && country.flags.svg && country.translations.spa);
        startGame();
    } catch (error) {
        console.error("Error fetching countries:", error);
        gameContainer.innerHTML = `<p>Error al cargar los datos. Inténtalo de nuevo más tarde.</p>`;
    } finally {
        loader.classList.add('hidden');
    }
}

// 2. Iniciar o reiniciar el juego
function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    feedbackText.textContent = '';
    resultsContainer.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    
    quizCountries = getRandomElements(countries, TOTAL_QUESTIONS);
    
    updateUIText();
    displayQuestion();
}

// NUEVA FUNCIÓN: Actualizar los textos de la UI según el idioma
function updateUIText() {
    document.getElementById('game-title').textContent = UI_TEXT[selectedLanguage].gameTitle;
    document.getElementById('results-title').textContent = UI_TEXT[selectedLanguage].resultsTitle;
    document.getElementById('play-again-btn').textContent = UI_TEXT[selectedLanguage].playAgain;
}

// NUEVA FUNCIÓN: Obtener el nombre del país en el idioma correcto
function getCountryName(country) {
    if (selectedLanguage === 'es') {
        return country.translations.spa.common;
    }
    return country.name.common;
}

// 3. Mostrar una nueva pregunta (bandera y opciones)
function displayQuestion() {
    optionsContainer.innerHTML = '';
    feedbackText.textContent = '';

    if (currentQuestionIndex >= TOTAL_QUESTIONS) {
        showResults();
        return;
    }

    progressText.textContent = UI_TEXT[selectedLanguage].progress(currentQuestionIndex + 1, TOTAL_QUESTIONS);

    const correctCountry = quizCountries[currentQuestionIndex];
    flagImg.src = correctCountry.flags.svg;
    flagImg.alt = `Bandera de ${getCountryName(correctCountry)}`;

    const incorrectOptions = getRandomElements(
        countries.filter(c => getCountryName(c) !== getCountryName(correctCountry)), 
        3
    );
    
    const options = shuffleArray([...incorrectOptions, correctCountry]);

    options.forEach(country => {
        const button = document.createElement('button');
        button.textContent = getCountryName(country); // MODIFICADO
        button.classList.add('option-btn');
        button.onclick = () => handleOptionClick(button, getCountryName(country), getCountryName(correctCountry)); // MODIFICADO
        optionsContainer.appendChild(button);
    });
}

// 4. Manejar el clic en una opción
function handleOptionClick(button, selectedName, correctName) {
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

    if (selectedName === correctName) {
        score++;
        button.classList.add('correct');
        feedbackText.textContent = UI_TEXT[selectedLanguage].correct;
        feedbackText.style.color = '#22c55e';
    } else {
        button.classList.add('incorrect');
        feedbackText.textContent = UI_TEXT[selectedLanguage].incorrect(correctName); // MODIFICADO
        feedbackText.style.color = '#ef4444';
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.textContent === correctName) {
                btn.classList.add('correct');
            }
        });
    }

    currentQuestionIndex++;
    setTimeout(displayQuestion, 1500);
}

// 5. Mostrar los resultados finales
function showResults() {
    gameContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    finalScoreText.textContent = UI_TEXT[selectedLanguage].finalScore(score, TOTAL_QUESTIONS); // MODIFICADO
}

// --- FUNCIONES AUXILIARES ---
function getRandomElements(arr, num) {
    return [...arr].sort(() => 0.5 - Math.random()).slice(0, num);
}

function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

// --- INICIO ---
playAgainBtn.addEventListener('click', startGame);

// MODIFICADO: El juego ahora empieza al hacer clic en un idioma
langButtons.forEach(button => {
    button.addEventListener('click', () => {
        selectedLanguage = button.dataset.lang;
        langSelectorContainer.classList.add('hidden');
        fetchCountries(); // El juego comienza aquí
    });
});