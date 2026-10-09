const SUPABASE_URL = "https://cpgomltdjpbvbtflccby.supabase.co";
const SUPABASE_KEY = "Sb_publishable_BhK59A0qfRZ7-PBD1dYy7g_rZVE9M1c";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let isSignUp = false;
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};

// সেশন চেক করা
async function checkUserSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        showExamSection();
    } else {
        showAuthSection();
    }
}

function toggleAuthMode(e) {
    e.preventDefault();
    isSignUp = !isSignUp;
    document.getElementById('auth-title').innerText = isSignUp ? "রেজিস্ট্রেশন করুন" : "লগইন করুন";
    document.getElementById('auth-btn').innerText = isSignUp ? "সাইনআপ" : "লগইন";
    document.getElementById('toggle-text').innerText = isSignUp ? "আগে থেকেই অ্যাকাউন্ট আছে?" : "অ্যাকাউন্ট নেই?";
    document.getElementById('toggle-link').innerText = isSignUp ? "লগইন করুন" : "রেজিস্ট্রেশন করুন";
}

async function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert("ইমেইল এবং পাসওয়ার্ড দিন!");
        return;
    }

    if (isSignUp) {
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) alert("ত্রুটি: " + error.message);
        else alert("রেজিস্ট্রেশন সফল হয়েছে! এখন লগইন করুন।");
    } else {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) alert("লগইন ব্যর্থ: " + error.message);
        else {
            showExamSection();
        }
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    location.reload();
}

function showAuthSection() {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('exam-section').classList.add('hidden');
}

function showExamSection() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('exam-section').classList.remove('hidden');
    loadQuestions();
}

// Supabase থেকে প্রশ্ন লোড করা
async function loadQuestions() {
    const { data, error } = await supabaseClient.from('questions').select('*');

    if (error || !data || data.length === 0) {
        document.getElementById('question-text').innerText = "কোনো প্রশ্ন পাওয়া যায়নি! ডেটাবেস চেক করুন।";
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

    const { data: { user } } = await supabaseClient.auth.getUser();

    await supabaseClient.from('exam_results').insert([
        { student_name: user ? user.email : "Student", score: score, total_questions: questions.length }
    ]);

    alert(`পরীক্ষা সম্পন্ন হয়েছে! আপনার স্কোর: ${score} / ${questions.length}`);
    location.reload();
}

window.onload = checkUserSession;
