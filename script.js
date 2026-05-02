/**
 * NutriMed Clinical Nutrition System
 * Core Logic Module
 */

// --- Global State ---
let patientData = {
    name: '',
    age: 0,
    gender: '',
    weight: 0,
    height: 0,
    activity: 1.2,
    condition: '',
    bmi: 0,
    bmr: 0,
    tdee: 0,
    macros: {
        carbs: 0,
        protein: 0,
        fats: 0
    }
};

let foodIntake = [];

// --- Navigation Logic ---
const navLinks = document.querySelectorAll('.nav-links li');
const sections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');

function switchSection(targetId) {
    // Hide all sections
    sections.forEach(sec => sec.classList.remove('active'));
    // Show target section
    const targetSection = document.getElementById(targetId);
    if (targetSection) targetSection.classList.add('active');

    // Update active state in nav
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === targetId) {
            link.classList.add('active');
        }
    });

    // Update Header Text
    const titles = {
        'home': { title: 'Dashboard Overview', subtitle: 'Welcome back, Specialist.' },
        'patient-info': { title: 'Patient Admission', subtitle: 'Capture metabolic baseline data.' },
        'nutrient-calculator': { title: 'Nutritional Assessment', subtitle: 'Calculated metabolic requirements.' },
        'food-intake': { title: 'Dietary Intake Log', subtitle: 'Detailed analysis of daily consumption.' },
        'reports': { title: 'Clinical Report', subtitle: 'Consolidated patient nutrition summary.' },
        'about': { title: 'About NutriMed', subtitle: 'System information and clinical standards.' }
    };

    if (titles[targetId]) {
        pageTitle.innerText = titles[targetId].title;
        pageSubtitle.innerText = titles[targetId].subtitle;
    }

    // Special Trigger: If entering reports, generate report
    if (targetId === 'reports') {
        generateReport();
    }
}

// Attach event listeners to nav
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const target = link.getAttribute('data-section');
        switchSection(target);
    });
});

// --- Patient Information & Calculations ---
const patientForm = document.getElementById('patient-form');

patientForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Gather Data
    patientData.name = document.getElementById('name').value;
    patientData.age = parseInt(document.getElementById('age').value);
    patientData.gender = document.getElementById('gender').value;
    patientData.weight = parseFloat(document.getElementById('weight').value);
    patientData.height = parseFloat(document.getElementById('height').value);
    patientData.activity = parseFloat(document.getElementById('activity').value);
    patientData.condition = document.getElementById('condition').value || 'None noted.';

    // 2. Perform Calculations
    calculateNutrients();

    // 3. UI Feedback
    alert('Patient Bio-Data processed successfully. Navigating to Calculator.');
    switchSection('nutrient-calculator');
    updateCalculatorUI();
});

function calculateNutrients() {
    const { gender, weight, height, age, activity } = patientData;

    // BMI: weight (kg) / [height (m)]^2
    const heightInMeters = height / 100;
    patientData.bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    // BMR (Mifflin-St Jeor)
    // Men: 10*weight + 6.25*height - 5*age + 5
    // Women: 10*weight + 6.25*height - 5*age - 161
    if (gender === 'male') {
        patientData.bmr = Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5);
    } else {
        patientData.bmr = Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
    }

    // TDEE: BMR * Activity Factor
    patientData.tdee = Math.round(patientData.bmr * activity);

    // Standard Macro Distribution (Carbs 50%, Protein 20%, Fat 30%)
    // kcal/g: Carbs=4, Protein=4, Fat=9
    patientData.macros.carbs = Math.round((patientData.tdee * 0.50) / 4);
    patientData.macros.protein = Math.round((patientData.tdee * 0.20) / 4);
    patientData.macros.fats = Math.round((patientData.tdee * 0.30) / 9);
}

function updateCalculatorUI() {
    document.getElementById('res-bmi').innerText = patientData.bmi;
    document.getElementById('res-bmr').innerText = patientData.bmr;
    document.getElementById('res-tdee').innerText = patientData.tdee;

    // BMI Tags
    const bmiTag = document.getElementById('res-bmi-status');
    const b = parseFloat(patientData.bmi);
    bmiTag.className = 'status-tag'; // reset
    if (b < 18.5) {
        bmiTag.innerText = 'Underweight';
        bmiTag.classList.add('orange');
    } else if (b < 25) {
        bmiTag.innerText = 'Normal';
        bmiTag.classList.add('green');
    } else if (b < 30) {
        bmiTag.innerText = 'Overweight';
        bmiTag.classList.add('orange');
    } else {
        bmiTag.innerText = 'Obese';
        bmiTag.classList.add('red');
    }

    // Macros
    document.getElementById('macro-carbs').innerText = patientData.macros.carbs;
    document.getElementById('macro-protein').innerText = patientData.macros.protein;
    document.getElementById('macro-fats').innerText = patientData.macros.fats;
}

// --- Food Intake Logic ---
const foodForm = document.getElementById('food-form');
const foodList = document.getElementById('food-list');

foodForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const item = {
        id: Date.now(),
        name: document.getElementById('food-name').value,
        kcal: parseInt(document.getElementById('food-calories').value),
        protein: parseInt(document.getElementById('food-protein').value),
        carbs: parseInt(document.getElementById('food-carbs').value),
        fats: parseInt(document.getElementById('food-fats').value),
    };

    foodIntake.push(item);
    renderFoodTable();
    foodForm.reset();
});

function renderFoodTable() {
    foodList.innerHTML = '';
    let totKcal = 0, totProt = 0, totCarb = 0, totFat = 0;

    foodIntake.forEach((item, index) => {
        totKcal += item.kcal;
        totProt += item.protein;
        totCarb += item.carbs;
        totFat += item.fats;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.kcal}</td>
            <td>${item.protein}</td>
            <td>${item.carbs}</td>
            <td>${item.fats}</td>
            <td>
                <button class="btn-delete" onclick="removeFood(${item.id})">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        `;
        foodList.appendChild(row);
    });

    // Update Totals
    document.getElementById('total-kcal').innerText = totKcal;
    document.getElementById('total-protein').innerText = totProt;
    document.getElementById('total-carbs').innerText = totCarb;
    document.getElementById('total-fats').innerText = totFat;

    // Refresh Lucide Icons in table
    lucide.createIcons();
}

function removeFood(id) {
    foodIntake = foodIntake.filter(f => f.id !== id);
    renderFoodTable();
}

// --- Reporting Logic ---
function generateReport() {
    if (!patientData.name) {
        return; // No data yet
    }

    // 1. Report Header
    document.getElementById('report-date').innerText = new Date().toLocaleDateString();
    document.getElementById('report-id').innerText = Math.floor(Math.random() * 89999) + 10001;

    // 2. Patient Summary
    const ps = document.getElementById('report-patient-summary');
    ps.innerHTML = `
        <p><strong>Name:</strong> ${patientData.name}</p>
        <p><strong>Age:</strong> ${patientData.age} Years</p>
        <p><strong>Sex:</strong> ${patientData.gender.toUpperCase()}</p>
        <p><strong>Clinical Notes:</strong> ${patientData.condition}</p>
    `;

    // 3. Metabolic Summary
    const ms = document.getElementById('report-metabolic-summary');
    ms.innerHTML = `
        <p><strong>BMI:</strong> ${patientData.bmi} kg/m²</p>
        <p><strong>BMR:</strong> ${patientData.bmr} kcal/day</p>
        <p><strong>TDEE:</strong> ${patientData.tdee} kcal/day</p>
        <p><strong>Target Macros:</strong> P:${patientData.macros.protein}g / C:${patientData.macros.carbs}g / F:${patientData.macros.fats}g</p>
    `;

    // 4. Intake Status
    const totKcal = foodIntake.reduce((acc, curr) => acc + curr.kcal, 0);
    document.getElementById('report-total-kcal').innerText = `${totKcal} kcal`;

    const statusEl = document.getElementById('report-intake-status');
    const diff = totKcal - patientData.tdee;
    if (Math.abs(diff) < 100) {
        statusEl.innerText = 'Adequate Intake (On Target)';
        statusEl.style.color = 'var(--success)';
    } else if (diff > 0) {
        statusEl.innerText = `Caloric Surplus (+${diff} kcal)`;
        statusEl.style.color = 'var(--warning)';
    } else {
        statusEl.innerText = `Caloric Deficit (${diff} kcal)`;
        statusEl.style.color = 'var(--primary)';
    }

    // Refresh icons
    lucide.createIcons();
}

// Simulated Download
document.getElementById('download-report').addEventListener('click', () => {
    alert('Simulating PDF Generation...\n\nNutriMed Clinical Report for ' + patientData.name + ' has been queued for download.');
});

// Initialize first view
switchSection('home');

// --- Chatbot Logic ---
const chatbotToggler = document.querySelector('.chatbot-toggler');
const closeChatbot = document.querySelector('.close-chatbot');
const chatbotContainer = document.querySelector('.chatbot-container');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// Toggle chat window
chatbotToggler.addEventListener('click', () => {
    chatbotContainer.classList.add('active');
    chatInput.focus();
});

closeChatbot.addEventListener('click', () => {
    chatbotContainer.classList.remove('active');
});

// NutriBot Knowledge Base
const responses = {
    greetings: ["Hello! I'm NutriBot. How can I assist you with clinical nutrition today?", "Hi there! Need help calculating BMI, BMR, or TDEE?"],
    bmi: ["BMI (Body Mass Index) is a simple index of weight-for-height. You can calculate it in the 'Patient Info' section.", "To check your BMI status, please fill out the Patient Admission Form first!"],
    bmr: ["BMR (Basal Metabolic Rate) is the number of calories required to keep your body functioning at rest. We use the Mifflin-St Jeor equation by default.", "Need to calculate BMR? Go to Patient Info and enter your details."],
    tdee: ["TDEE (Total Daily Energy Expenditure) multiplies your BMR by your activity level to estimate total calories burned.", "TDEE helps you understand how many calories you need to maintain your weight."],
    food: ["You can log your food intake in the 'Food Intake' section to track your macros.", "To add food items, navigate to the Food Intake Log and enter the item's nutritional details."],
    report: ["You can generate a clinical report of the patient's nutritional assessment in the 'Reports' section.", "Finished with the calculations? Check the 'Reports' tab for a printable summary."],
    default: ["I'm a simple clinical assistant. You can ask me about BMI, BMR, TDEE, logging food, or generating reports.", "I'm sorry, I didn't catch that. Try asking about BMR, TDEE, or BMI calculations."]
};

const getBotResponse = (message) => {
    const text = message.toLowerCase();
    
    if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
        return responses.greetings[Math.floor(Math.random() * responses.greetings.length)];
    } else if (text.includes('bmi')) {
        return responses.bmi[Math.floor(Math.random() * responses.bmi.length)];
    } else if (text.includes('bmr')) {
        return responses.bmr[Math.floor(Math.random() * responses.bmr.length)];
    } else if (text.includes('tdee') || text.includes('calorie') || text.includes('energy')) {
        return responses.tdee[Math.floor(Math.random() * responses.tdee.length)];
    } else if (text.includes('food') || text.includes('diet') || text.includes('eat')) {
        return responses.food[Math.floor(Math.random() * responses.food.length)];
    } else if (text.includes('report') || text.includes('print')) {
        return responses.report[Math.floor(Math.random() * responses.report.length)];
    } else {
        return responses.default[Math.floor(Math.random() * responses.default.length)];
    }
};

const createMessageElement = (text, type) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${type}-message`);
    
    const msgText = document.createElement('div');
    msgText.classList.add('msg-text');
    msgText.textContent = text;
    
    messageDiv.appendChild(msgText);
    return messageDiv;
};

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    chatMessages.appendChild(createMessageElement(message, 'user'));
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add bot response with slight delay
    setTimeout(() => {
        const botResponseText = getBotResponse(message);
        chatMessages.appendChild(createMessageElement(botResponseText, 'bot'));
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 600);
});
