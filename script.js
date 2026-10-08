let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedOption = null;
let timeLeft = 60; // পরীক্ষায় কত সেকেন্ড সময় থাকবে (এখানে ১ মিনিট)
let timerInterval;

// DOM Elements
const questionElement = document.querySelector('.question-text');
const optionsElement = document.querySelector('.options-list');
const nextBtn = document.querySelector('.btn');
const timerElement = document.querySelector('.timer-box');

// Fetch Questions from questions.json
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        questions = await response.json();
        if (questions.length > 0) {
            startTimer();
            showQuestion();
        } else {
            questionElement.innerText = "কোনো প্রশ্ন পাওয়া যায়নি!";
        }
    } catch (error) {
        console.error("প্রশ্ন লোড করতে সমস্যা হয়েছে:", error);
        questionElement.innerText = "প্রশ্ন লোড করা সম্ভব হয়নি।";
    }
}

// Show Current Question
function showQuestion() {
    resetState();
    const currentQuestion = questions[currentQuestionIndex];
    questionElement.innerText = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;

    currentQuestion.options.forEach((optionText, index) => {
        const li = document.createElement('li');
        li.innerText = optionText;
        li.classList.add('option-item');
        li.addEventListener('click', () => selectOption(li, index));
        optionsElement.appendChild(li);
    });
}

// Option Selection Logic
function selectOption(selectedLi, index) {
    const allOptions = document.querySelectorAll('.option-item');
    allOptions.forEach(li => li.classList.remove('selected'));
    
    selectedLi.classList.add('selected');
    selectedOption = index;
}

// Reset Options for Next Question
function resetState() {
    selectedOption = null;
    optionsElement.innerHTML = '';
}

// Handle Next Button Click
nextBtn.addEventListener('click', () => {
    if (selectedOption === null) {
        alert("অনুগ্রহ করে একটি উত্তর সিলেক্ট করুন!");
        return;
    }

    // Check Answer
    if (selectedOption === questions[currentQuestionIndex].answer) {
        score++;
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        finishExam();
    }
});

// Timer Function
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.innerText = `⏱️ ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("সময় শেষ হয়ে গেছে!");
            finishExam();
        }
    }, 1000);
}

// Finish Exam and Show Result
function finishExam() {
    clearInterval(timerInterval);
    const container = document.querySelector('.exam-container');
    container.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h2>🎉 পরীক্ষা সম্পন্ন হয়েছে!</h2>
            <p style="font-size: 18px; margin: 15px 0;">আপনার মোট স্কোর: <strong>${score} / ${questions.length}</strong></p>
            <button class="btn" onclick="location.reload()">পুনরায় চেষ্টা করুন</button>
        </div>
    `;
}

// Start Application
loadQuestions();
