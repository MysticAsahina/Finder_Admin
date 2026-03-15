// ════════════════════════════════════════════════════════════════════════════════
// 🛠️ FINDER ADMIN SYSTEM LOGIC
// ════════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Set current date
    const dateEl = document.getElementById('today-date');
    if(dateEl) {
        const d = new Date();
        dateEl.textContent = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Check if logged in (for demo, we just stay on login if body has logged-out)
    if (!document.body.classList.contains('logged-out')) {
        initDashCharts();
    }
});

// ════ PAGE NAVIGATION ════
function goto(pageId, navEl) {
    // Pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById('page-' + pageId);
    if(targetPage) targetPage.classList.add('active');

    // Nav Items
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(navEl) navEl.classList.add('active');

    // Title mapping
    const titles = {
        'dashboard': ['Dashboard', 'Overview'],
        'analytics': ['Analytics', 'Real-time Insights'],
        'drivers': ['Users', 'Driver Directory'],
        'applications': ['Applications', 'Pending Reviews'],
        'messages': ['Messages', 'Passenger Inquiries'],
        'reports': ['Reports', 'Operational Data'],
        'fare': ['Fare Management', 'Price Configuration'],
        'audit': ['Audit Log', 'System Activity'],
        'settings': ['Settings', 'Admin Preferences']
    };

    if(titles[pageId]) {
        document.getElementById('topbar-title').textContent = titles[pageId][0];
        document.getElementById('topbar-sub').textContent = '— ' + titles[pageId][1];
    }

    // Scroll to top
    document.querySelector('.content').scrollTop = 0;

    // Special init
    if(pageId === 'analytics') {
        setTimeout(initAnalyticsCharts, 100);
    }
}

// ════ AUTHENTICATION ════
function handleLogin(e) {
    if(e) e.preventDefault();
    document.body.classList.remove('logged-out');
    
    // Smooth transition
    const loginScreen = document.querySelector('.login-screen');
    loginScreen.style.opacity = '0';
    setTimeout(() => {
        loginScreen.style.display = 'none';
        initDashCharts();
    }, 400);
}

function handleLogout() {
    if(confirm('Are you sure you want to log out?')) {
        document.body.classList.add('logged-out');
        const loginScreen = document.querySelector('.login-screen');
        loginScreen.style.display = 'flex';
        loginScreen.style.opacity = '1';
    }
}

function openResetModal() {
    document.getElementById('reset-modal').classList.add('open');
}

function closeResetModal() {
    document.getElementById('reset-modal').classList.remove('open');
}

// ════ DRIVER MODAL ════
function openDriverModal(name, id, status, trips, rate, vehicle, contact) {
    document.getElementById('modal-avatar').textContent = name.split(' ').map(n => n[0]).join('');
    document.getElementById('modal-name2').textContent = name;
    document.getElementById('modal-id').textContent = id;
    document.getElementById('modal-status').textContent = status;
    document.getElementById('modal-trips').textContent = trips;
    document.getElementById('modal-rate').textContent = rate;
    document.getElementById('modal-vehicle').textContent = vehicle;
    document.getElementById('modal-contact').textContent = contact;
    
    // Status color
    const badge = document.getElementById('modal-status');
    badge.className = 'badge ' + (status.toLowerCase() === 'online' ? 'green' : 'gray');

    document.getElementById('driver-modal').classList.add('open');
}

function closeDriverModal() {
    document.getElementById('driver-modal').classList.remove('open');
}

// ════ MESSAGES ════
function selectMsg(el, name, subject, content, time) {
    document.querySelectorAll('.msg-item').forEach(m => m.classList.remove('active'));
    el.classList.add('active');
    
    document.getElementById('msg-sender-name').textContent = name;
    document.getElementById('msg-subject').textContent = subject;
    document.getElementById('msg-content').textContent = content;
    
    // Clear reply
    document.getElementById('msg-reply-input').value = '';
}

function sendReply() {
    const input = document.getElementById('msg-reply-input');
    if(!input.value.trim()) return;

    const body = document.getElementById('msg-body');
    const msgDiv = document.createElement('div');
    msgDiv.style.alignSelf = 'flex-end';
    msgDiv.innerHTML = `
        <div class="bubble out">${input.value}</div>
        <div class="bubble-time out-time">Just now</div>
    `;
    body.appendChild(msgDiv);
    input.value = '';
    body.scrollTop = body.scrollHeight;
}

// ════ APPLICATIONS ════
function approveApp(btn) {
    if(confirm('Approve this driver application?')) {
        const card = btn.closest('.app-card');
        card.style.opacity = '0.5';
        card.style.pointerEvents = 'none';
        btn.textContent = 'Approved ✓';
        btn.className = 'btn btn-ghost';
    }
}

function rejectApp(btn) {
    if(confirm('Reject this application?')) {
        btn.closest('.app-card').remove();
    }
}

// ════ CHARTS ════
let tripChart, analyticsTrendChart, peakHoursChart, donutChart;

function initDashCharts() {
    const ctx = document.getElementById('dashTripChart');
    if(!ctx) return;
    
    if(tripChart) tripChart.destroy();

    tripChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Completed',
                    data: [85, 102, 80, 98, 108, 120, 115],
                    backgroundColor: '#fa7528',
                    borderRadius: 6,
                    barThickness: 32
                },
                {
                    label: 'Cancelled',
                    data: [12, 15, 8, 12, 18, 10, 14],
                    backgroundColor: '#fca5a5',
                    borderRadius: 6,
                    barThickness: 32
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                        padding: 20,
                        font: { weight: 600, size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 140,
                    grid: { color: '#f5ede8', drawBorder: false },
                    ticks: { stepSize: 20, font: { weight: 500 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { weight: 600 } }
                }
            }
        }
    });
}

function initAnalyticsCharts() {
    // Daily Trip - Line Chart
    const ctx1 = document.getElementById('analyticsTrendChart');
    if(ctx1) {
        if(analyticsTrendChart) analyticsTrendChart.destroy();
        analyticsTrendChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['1', '3', '5', '7', '9', '11', '14', '18', '21', '23', '27', '30'],
                datasets: [{
                    label: 'Trips',
                    data: [96, 112, 104, 115, 110, 106, 118, 114, 116, 122, 108, 114],
                    borderColor: '#fa7528',
                    backgroundColor: 'rgba(250, 117, 40, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 4,
                    pointRadius: 6,
                    pointBackgroundColor: '#fa7528',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        beginAtZero: false, 
                        min: 70, 
                        max: 140,
                        grid: { color: '#f5ede8', drawBorder: false },
                        ticks: { stepSize: 10, font: { weight: 500 } }
                    },
                    x: { grid: { display: false }, ticks: { font: { weight: 600 } } }
                }
            }
        });
    }

    // Peak Booking Hours - Bar Chart
    const ctx2 = document.getElementById('peakHoursChart');
    if(ctx2) {
        if(peakHoursChart) peakHoursChart.destroy();
        peakHoursChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'],
                datasets: [{
                    label: 'Trips',
                    data: [8, 24, 35, 18, 16, 12, 22, 14, 10, 17, 27, 32],
                    backgroundColor: '#fa7528',
                    borderRadius: 6,
                    barThickness: 28
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 35, grid: { color: '#f5ede8', drawBorder: false } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Donut Chart
    const ctx3 = document.getElementById('analyticsDonut');
    if(ctx3) {
        if(donutChart) donutChart.destroy();
        donutChart = new Chart(ctx3, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Cancelled'],
                datasets: [{
                    data: [88, 12],
                    backgroundColor: ['#fa7528', '#fca5a5'],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                }
            }
        });
    }
}
