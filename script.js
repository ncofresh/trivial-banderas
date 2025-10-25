// --- ELEMENTOS DEL DOM ---
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
const API_URL = 'https://restcountries.com/v3.1/all?fields=name,flags';
const TOTAL_QUESTIONS = 10;
let countries = [];
let currentQuestionIndex = 0;
let score = 0;
let quizCountries = []; // Países seleccionados para la partida actual

// --- FUNCIONES ---

// 1. Obtener los datos de los países desde la API
async function fetchCountries() {
    try {
        loader.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('No se pudo cargar la información.');
        const data = await response.json();
        // Filtramos países que tienen un nombre común y bandera SVG
        countries = data.filter(country => country.name.common && country.flags.svg);
        startGame();
    } catch (error) {
        console.error("Error fetching countries:", error);
        gameContainer.innerHTML = `<p>Error al cargar los datos. Inténtalo de nuevo más tarde.</p>`;
    } finally {
        loader.classList.add('hidden');
        gameContainer.classList.remove('hidden');
    }
}

// 2. Iniciar o reiniciar el juego
function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    feedbackText.textContent = '';
    resultsContainer.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    
    // Seleccionar 10 países al azar para la partida
    quizCountries = getRandomElements(countries, TOTAL_QUESTIONS);
    
    displayQuestion();
}

// 3. Mostrar una nueva pregunta (bandera y opciones)
function displayQuestion() {
    // Limpiar opciones anteriores
    optionsContainer.innerHTML = '';
    feedbackText.textContent = '';

    if (currentQuestionIndex >= TOTAL_QUESTIONS) {
        showResults();
        return;
    }

    progressText.textContent = `Intento ${currentQuestionIndex + 1} de ${TOTAL_QUESTIONS}`;

    const correctCountry = quizCountries[currentQuestionIndex];
    flagImg.src = correctCountry.flags.svg;
    flagImg.alt = `Bandera de ${correctCountry.name.common}`;

    // Obtener 3 opciones incorrectas
    const incorrectOptions = getRandomElements(
        countries.filter(c => c.name.common !== correctCountry.name.common), 
        3
    );
    
    const options = shuffleArray([...incorrectOptions, correctCountry]);

    // Crear botones para cada opción
    options.forEach(country => {
        const button = document.createElement('button');
        button.textContent = country.name.common;
        button.classList.add('option-btn');
        button.onclick = () => handleOptionClick(button, country.name.common, correctCountry.name.common);
        optionsContainer.appendChild(button);
    });
}

// 4. Manejar el clic en una opción
function handleOptionClick(button, selectedName, correctName) {
    // Deshabilitar todos los botones para evitar múltiples clics
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

    if (selectedName === correctName) {
        score++;
        button.classList.add('correct');
        feedbackText.textContent = '¡Correcto!';
        feedbackText.style.color = '#22c55e';
    } else {
        button.classList.add('incorrect');
        feedbackText.textContent = `Incorrecto. La respuesta era ${correctName}.`;
        feedbackText.style.color = '#ef4444';
        // Opcional: Resaltar la respuesta correcta
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.textContent === correctName) {
                btn.classList.add('correct');
            }
        });
    }

    currentQuestionIndex++;

    // Esperar un momento antes de pasar a la siguiente pregunta
    setTimeout(displayQuestion, 1500);
}

// 5. Mostrar los resultados finales
function showResults() {
    gameContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    finalScoreText.textContent = `Has acertado ${score} de ${TOTAL_QUESTIONS}`;
}

// --- FUNCIONES AUXILIARES ---

// Obtener un número de elementos aleatorios de un array
function getRandomElements(arr, num) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

// Mezclar un array
function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

// --- INICIO ---

// Añadir evento al botón de "Jugar de Nuevo"
playAgainBtn.addEventListener('click', startGame);

// Iniciar el juego por primera vez
fetchCountries();