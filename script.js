// Supabase কানেকশন
const SUPABASE_URL = "https://cpgomltdjpbvbtflccby.supabase.co";
const SUPABASE_KEY = "Sb_publishable_BhK59A0qfRZ7-PBD1dYy7g_rZVE9M1c";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};

// প্রশ্ন লোড করা
async function loadQuestions() {
    const { data, error } = await supabaseClient.from('questions').select('*');

    if (error || !data || data.length === 0) {
        document.getElementById('question-text').innerText = "কোনো প্রশ্ন পাওয়া যায়নি! Supabase ডেটাবেসে প্রশ্ন যুক্ত করুন।";
        return;
    }

    questions = data;
    showQuestion(0);
}

function showQuestion(index) {
    const q = questions[index];
    document.getElementById('question-text').innerText = `${index + 1}. ${q.question_text}`;

    const optionsList = document.getElementById('options-list');
    optionsList.innerHTML = `
        <li><label><input type="radio" name="option" value="A" ${userAnswers[index] === 'A' ? 'checked' : ''}> A) ${q.option_a}</label></li>
        <li><label><input type="radio" name="option" value="B" ${userAnswers[index] === 'B' ? 'checked' : ''}> B) ${q.option_b}</label></li>
        <li><label><input type="radio" name="option" value="C" ${userAnswers[index] === 'C' ? 'checked' : ''}> C) ${q.option_c}</label></li>
        <li><label><input type="radio" name="option" value="D" ${userAnswers[index] === 'D' ? 'checked' : ''}> D) ${q.option_d}</label></li>
    `;

    // অপশন সিলেক্ট সেভ করা
    const inputs = optionsList.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('change', (e) => {
            userAnswers[index] = e.target.value;
        });
    });

    if (index === questions.length - 1) {
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('submit-btn').style.display = 'inline-block';
    } else {
        document.getElementById('next-btn').style.display = 'inline-block';
        document.getElementById('submit-btn').style.display = 'none';
    }
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    }
}

async function submitExam() {
    let score = 0;
    questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correct_option) {
            score++;
        }
    });

    // রেজাল্ট সেভ
    await supabaseClient.from('exam_results').insert([
        { student_name: "Student", score: score, total_questions: questions.length }
    ]);

    alert(`পরীক্ষা সম্পন্ন হয়েছে! আপনার স্কোর: ${score} / ${questions.length}`);
    location.reload();
}

// পেজ লোড হলে প্রশ্ন লোড হবে
window.onload = loadQuestions;
