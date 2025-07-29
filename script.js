// Application State
let currentSection = 'menu';
let mathState = {
    currentQuestion: 1,
    score: 0,
    questions: [],
    answers: []
};
let reactionState = {
    currentAttempt: 1,
    times: [],
    startTime: null,
    isWaiting: false,
    timeout: null
};

// DOM Elements
const elements = {
    mainMenu: document.getElementById('mainMenu'),
    mathTrainer: document.getElementById('mathTrainer'),
    reactionTest: document.getElementById('reactionTest'),
    mathTrainerBtn: document.getElementById('mathTrainerBtn'),
    reactionTestBtn: document.getElementById('reactionTestBtn'),
    globalHome: document.getElementById('globalHome'),

    // Math elements
    questionText: document.getElementById('questionText'),
    answerInput: document.getElementById('answerInput'),
    remainderInput: document.getElementById('remainderInput'),
    submitAnswer: document.getElementById('submitAnswer'),
    currentQuestion: document.getElementById('currentQuestion'),
    score: document.getElementById('score'),
    mathResults: document.getElementById('mathResults'),
    mathGame: document.getElementById('mathGame'),
    finalScore: document.getElementById('finalScore'),
    percentage: document.getElementById('percentage'),
    restartMath: document.getElementById('restartMath'),
    backFromMath: document.getElementById('backFromMath'),

    // Reaction elements
    reactionDot: document.getElementById('reactionDot'),
    reactionArea: document.getElementById('reactionArea'),
    reactionInstructions: document.getElementById('reactionInstructions'),
    currentAttempt: document.getElementById('currentAttempt'),
    currentTime: document.getElementById('currentTime'),
    startReaction: document.getElementById('startReaction'),
    reactionGame: document.getElementById('reactionGame'),
    reactionResults: document.getElementById('reactionResults'),
    averageTime: document.getElementById('averageTime'),
    allTimes: document.getElementById('allTimes'),
    restartReaction: document.getElementById('restartReaction'),
    backFromReaction: document.getElementById('backFromReaction')
};

// Event Listeners
elements.mathTrainerBtn.addEventListener('click', () => showSection('math'));
elements.reactionTestBtn.addEventListener('click', () => showSection('reaction'));
elements.globalHome.addEventListener('click', () => showSection('menu'));
elements.submitAnswer.addEventListener('click', submitMathAnswer);
elements.answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        // If remainder field is visible and empty, focus on it
        if (elements.remainderInput.style.display !== 'none' && !elements.remainderInput.value) {
            elements.remainderInput.focus();
        } else {
            // Otherwise submit the answer
            submitMathAnswer();
        }
    }
});
elements.remainderInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitMathAnswer();
    }
});
elements.startReaction.addEventListener('click', startReactionTest);
elements.reactionArea.addEventListener('click', handleReactionClick);
elements.restartMath.addEventListener('click', () => {
    resetMathGame();
    showSection('math');
});
elements.backFromMath.addEventListener('click', () => showSection('menu'));
elements.restartReaction.addEventListener('click', () => {
    resetReactionGame();
    showSection('reaction');
});
elements.backFromReaction.addEventListener('click', () => showSection('menu'));

// Section Management
function showSection(section) {
    elements.mainMenu.classList.add('hidden');
    elements.mathTrainer.classList.add('hidden');
    elements.reactionTest.classList.add('hidden');

    switch(section) {
        case 'menu':
            elements.mainMenu.classList.remove('hidden');
            elements.globalHome.classList.add('hidden');
            break;
        case 'math':
            elements.mathTrainer.classList.remove('hidden');
            elements.globalHome.classList.remove('hidden');
            if (mathState.currentQuestion === 1 && mathState.questions.length === 0) {
                initMathGame();
            }
            break;
        case 'reaction':
            elements.reactionTest.classList.remove('hidden');
            elements.globalHome.classList.remove('hidden');
            break;
    }
    currentSection = section;
}

// Math Game Functions
function initMathGame() {
    resetMathGame();
    generateAllQuestions();
    showCurrentQuestion();
}

function resetMathGame() {
    mathState = {
        currentQuestion: 1,
        score: 0,
        questions: [],
        answers: []
    };
    elements.mathGame.classList.remove('hidden');
    elements.mathResults.classList.add('hidden');
    updateMathDisplay();
}

function generateAllQuestions() {
    mathState.questions = [];
    for (let i = 0; i < 20; i++) {
        mathState.questions.push(generateMathQuestion());
    }
}

function generateMathQuestion() {
    const operations = ['+', '-', '*', '/'];
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2, correctAnswer, remainder;

    switch(operation) {
        case '+':
            // Addition: mix of positive and negative numbers
            num1 = Math.floor(Math.random() * 1000) - 200; // -200 to 800
            num2 = Math.floor(Math.random() * 600) - 100;  // -100 to 500
            correctAnswer = num1 + num2;
            remainder = 0;
            break;
        case '-':
            // Subtraction: can result in negative numbers
            num1 = Math.floor(Math.random() * 600) - 100;  // -100 to 500
            num2 = Math.floor(Math.random() * 400) + 50;   // 50 to 450
            correctAnswer = num1 - num2;
            remainder = 0;
            break;
        case '*':
            // Multiplication: include negative numbers
            num1 = Math.floor(Math.random() * 40) - 10;    // -10 to 30
            num2 = Math.floor(Math.random() * 30) - 5;     // -5 to 25
            // Avoid multiplying by 0
            if (num1 === 0) num1 = Math.random() > 0.5 ? 1 : -1;
            if (num2 === 0) num2 = Math.random() > 0.5 ? 1 : -1;
            correctAnswer = num1 * num2;
            remainder = 0;
            break;
        case '/':
            // Division: handle negative numbers with proper remainder rules
            // Mathematical convention: a = b * q + r where 0 <= r < |b|
            num2 = Math.floor(Math.random() * 15) + 7;     // 7 to 22 (positive divisor)

            // Generate a dividend that may be negative
            let dividend = Math.floor(Math.random() * 800) - 200; // -200 to 600

            // Calculate quotient and remainder using JavaScript's built-in division
            correctAnswer = Math.floor(dividend / num2);
            remainder = dividend - (correctAnswer * num2);

            // Ensure remainder is non-negative (mathematical convention)
            if (remainder < 0) {
                correctAnswer -= 1;
                remainder += num2;
            }

            num1 = dividend;
            break;
    }

    return {
        num1,
        num2,
        operation,
        correctAnswer,
        remainder,
        text: `${num1} ${operation} ${num2}`
    };
}

function showCurrentQuestion() {
    const question = mathState.questions[mathState.currentQuestion - 1];
    elements.questionText.textContent = question.text;
    elements.answerInput.value = '';
    elements.remainderInput.value = '';
    elements.answerInput.focus();

    // Show/hide remainder input based on operation
    if (question.operation === '/') {
        elements.remainderInput.style.display = 'block';
        elements.remainderInput.previousElementSibling.style.display = 'block';
    } else {
        elements.remainderInput.style.display = 'none';
        elements.remainderInput.previousElementSibling.style.display = 'none';
    }
}

function submitMathAnswer() {
    const question = mathState.questions[mathState.currentQuestion - 1];
    const userAnswer = parseInt(elements.answerInput.value);
    const userRemainder = parseInt(elements.remainderInput.value) || 0;

    if (isNaN(userAnswer)) {
        alert('Please enter a valid answer');
        return;
    }

    const isCorrect = userAnswer === question.correctAnswer &&
                     (question.operation !== '/' || userRemainder === question.remainder);

    if (isCorrect) {
        mathState.score++;
    }

    mathState.answers.push({
        question: question.text,
        userAnswer,
        userRemainder,
        correctAnswer: question.correctAnswer,
        correctRemainder: question.remainder,
        isCorrect
    });

    // Show immediate feedback
    showMathFeedback(isCorrect, question);

    // Update score display immediately
    updateMathDisplay();

    // Move to next question or show results after a delay
    setTimeout(() => {
        if (mathState.currentQuestion < 20) {
            mathState.currentQuestion++;
            updateMathDisplay();
            showCurrentQuestion();
        } else {
            showMathResults();
        }
    }, 600);
}

function updateMathDisplay() {
    elements.currentQuestion.textContent = mathState.currentQuestion;
    elements.score.textContent = mathState.score;
}

function showMathFeedback(isCorrect, question) {
    // Disable the submit button temporarily
    elements.submitAnswer.disabled = true;
    elements.answerInput.disabled = true;
    elements.remainderInput.disabled = true;

    // Create feedback message
    let feedbackMessage = '';
    if (isCorrect) {
        feedbackMessage = '✅ Correct!';
        elements.questionText.style.color = '#28a745';
    } else {
        if (question.operation === '/') {
            feedbackMessage = `❌ Incorrect. The answer is ${question.correctAnswer} with remainder ${question.remainder}`;
        } else {
            feedbackMessage = `❌ Incorrect. The answer is ${question.correctAnswer}`;
        }
        elements.questionText.style.color = '#dc3545';
    }

    // Show feedback
    elements.questionText.textContent = feedbackMessage;

    // Reset styles and re-enable inputs after delay
    setTimeout(() => {
        elements.submitAnswer.disabled = false;
        elements.answerInput.disabled = false;
        elements.remainderInput.disabled = false;
        elements.questionText.style.color = '#333';
    }, 600);
}

function showMathResults() {
    elements.mathGame.classList.add('hidden');
    elements.mathResults.classList.remove('hidden');
    elements.finalScore.textContent = mathState.score;
    elements.percentage.textContent = Math.round((mathState.score / 20) * 100);
}

// Reaction Game Functions
function resetReactionGame() {
    reactionState = {
        currentAttempt: 1,
        times: [],
        startTime: null,
        isWaiting: false,
        timeout: null
    };
    elements.reactionGame.classList.remove('hidden');
    elements.reactionResults.classList.add('hidden');
    elements.reactionDot.classList.remove('green');
    elements.currentAttempt.textContent = '1';
    elements.currentTime.textContent = '-';
    elements.reactionInstructions.textContent = 'Click the dot when it turns green!';
    elements.startReaction.style.display = 'block';
}

function startReactionTest() {
    elements.startReaction.style.display = 'none';
    elements.reactionInstructions.textContent = 'Wait for the dot to turn green...';
    elements.reactionDot.classList.remove('green');
    reactionState.isWaiting = true;

    // Random delay between 1-5 seconds
    const delay = Math.random() * 4000 + 1000;

    reactionState.timeout = setTimeout(() => {
        if (reactionState.isWaiting) {
            elements.reactionDot.classList.add('green');
            elements.reactionInstructions.textContent = 'Click now!';
            reactionState.startTime = Date.now();
        }
    }, delay);
}

function startNextReactionRound() {
    elements.reactionInstructions.textContent = 'Wait for the dot to turn green...';
    elements.reactionDot.classList.remove('green');
    reactionState.isWaiting = true;
    reactionState.startTime = null;

    // Random delay between 1-5 seconds
    const delay = Math.random() * 4000 + 1000;

    reactionState.timeout = setTimeout(() => {
        if (reactionState.isWaiting) {
            elements.reactionDot.classList.add('green');
            elements.reactionInstructions.textContent = 'Click now!';
            reactionState.startTime = Date.now();
        }
    }, delay);
}

function handleReactionClick() {
    if (!reactionState.isWaiting) return;

    if (!reactionState.startTime) {
        // Clicked too early
        clearTimeout(reactionState.timeout);
        elements.reactionInstructions.textContent = 'Too early! Wait for green. Restarting this attempt...';
        elements.reactionDot.classList.remove('green');
        reactionState.isWaiting = false;

        setTimeout(() => {
            startNextReactionRound();
        }, 1500);
        return;
    }

    // Valid click
    const reactionTime = Date.now() - reactionState.startTime;
    reactionState.times.push(reactionTime);
    elements.currentTime.textContent = reactionTime;
    elements.reactionDot.classList.remove('green');
    reactionState.isWaiting = false;
    reactionState.startTime = null;

    if (reactionState.currentAttempt < 5) {
        reactionState.currentAttempt++;
        elements.currentAttempt.textContent = reactionState.currentAttempt;
        elements.reactionInstructions.textContent = 'Good! Get ready for the next attempt...';

        setTimeout(() => {
            startNextReactionRound();
        }, 1500);
    } else {
        showReactionResults();
    }
}

function showReactionResults() {
    elements.reactionGame.classList.add('hidden');
    elements.reactionResults.classList.remove('hidden');

    const average = Math.round(reactionState.times.reduce((a, b) => a + b, 0) / reactionState.times.length);
    elements.averageTime.textContent = average;

    const timesHtml = reactionState.times.map((time, index) =>
        `<p>Attempt ${index + 1}: ${time}ms</p>`
    ).join('');
    elements.allTimes.innerHTML = timesHtml;
}

// Initialize the application
showSection('menu');
