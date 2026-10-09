const SUPABASE_URL = "https://cpgomltdjpbvbtflccby.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZ29tbHRkanBidmJ0ZmxjY2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDU0NTcsImV4cCI6MjEwNzEyMTQ1N30.Mpl6NT3ViunmN3_WH4GxA61QNBF_WaRsqj0Yt51Qmss";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true }
});

const ADMIN_EMAIL = "absiddikrobi1739@gmail.com";

let isSignUp = false;
let questions = [];
let currentQuestionIndex = 0;

async function checkUserSession() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            if (session.user.email === ADMIN_EMAIL) {
                showSection('admin-section');
            } else {
                showSection('exam-section');
                loadQuestions();
            }
        } else {
            showSection('auth-section');
        }
    } catch (err) {
        showSection('auth-section');
    }
}

function showSection(id) {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('exam-section').classList.add('hidden');
    document.getElementById('admin-section').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
}

function toggleAuthMode(e) {
    e.preventDefault();
    isSignUp = !isSignUp;
    document.getElementById('auth-title').innerText = isSignUp ? "রেজিস্ট্রেশন করুন" : "লগইন করুন";
    document.getElementById('auth-btn').innerText = isSignUp ? "সাইনআপ" : "লগইন";
    document.getElementById('toggle-text').innerText = isSignUp ? "আগে থেকেই অ্যাকাউন্ট আছে?" : "অ্যাকাউন্ট নেই?";
}

async function handleAuth() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) return alert("ইমেইল ও পাসওয়ার্ড প্রদান করুন!");

    if (isSignUp) {
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) {
            alert("রেজিস্ট্রেশন ত্রুটি: " + error.message);
        } else {
            alert("রেজিস্ট্রেশন সফল হয়েছে! এখন লগইন করুন।");
            toggleAuthMode(new Event('click'));
        }
    } else {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            alert("লগইন ব্যর্থ: " + error.message);
        } else {
            checkUserSession();
        }
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    location.reload();
}

async function loadQuestions() {
    const { data, error } = await supabaseClient.from('questions').select('*');
    if (error || !data || data.length === 0) {
        document.getElementById('question-text').innerText = "কোনো প্রশ্ন পাওয়া যায়নি বা ডেটাবেস কানেকশন সমস্যা।";
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
        <li><label><input type="radio" name="opt" value="A"> A) ${q.option_a}</label></li>
        <li><label><input type="radio" name="opt" value="B"> B) ${q.option_b}</label></li>
        <li><label><input type="radio" name="opt" value="C"> C) ${q.option_c}</label></li>
        <li><label><input type="radio" name="opt" value="D"> D) ${q.option_d}</label></li>
    `;
    
    document.getElementById('next-btn').classList.toggle('hidden', index === questions.length - 1);
    document.getElementById('submit-btn').classList.toggle('hidden', index !== questions.length - 1);
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    }
}

async function submitExam() {
    alert("পরীক্ষা সম্পন্ন হয়েছে!");
    location.reload();
}

async function addQuestionByAdmin() {
    const q = document.getElementById('admin-q').value;
    const a = document.getElementById('admin-a').value;
    const b = document.getElementById('admin-b').value;
    const c = document.getElementById('admin-c').value;
    const d = document.getElementById('admin-d').value;
    const correct = document.getElementById('admin-correct').value;

    if (!q || !a || !b || !c || !d || !correct) return alert("সব ঘর পূরণ করুন!");

    const { error } = await supabaseClient.from('questions').insert([
        { question_text: q, option_a: a, option_b: b, option_c: c, option_d: d, correct_option: correct, subject: 'Physics', chapter: 'Thermodynamics' }
    ]);

    if (error) alert("ত্রুটি: " + error.message);
    else {
        alert("প্রশ্ন সফলভাবে যুক্ত করা হয়েছে!");
        location.reload();
    }
}

window.onload = checkUserSession;
