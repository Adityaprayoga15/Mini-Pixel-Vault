// Daftar Hewan Pixel Art (6 Lama + 5 Baru)
const animals = [
    { name: "Ayam", file: "Ayam.webp" },
    { name: "Beruang", file: "Beruang.webp" },
    { name: "Gorila", file: "Gorila.webp" },
    { name: "Kucing", file: "Kucing.webp" },
    { name: "Monyet", file: "Monyet.webp" },
    { name: "Rubah", file: "Rubah.webp" },
    { name: "Hamster", file: "Hamster.webp" },
    { name: "Kelinci", file: "Kelinci.webp" },
    { name: "Panda", file: "Panda.webp" },
    { name: "Pinguin", file: "Pinguin.webp" },
    { name: "Singa", file: "Singa.webp" }
];

let currentAvatar = localStorage.getItem('userAvatar') || 'Ayam.webp';
let userName = "Aditya";

// Switch View Tabs & Navbar active states
function switchTab(tabName) {
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (tabName === 'vault') {
        document.getElementById('vaultView').classList.add('active');
        const btn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.textContent.includes('Vault'));
        if (btn) btn.classList.add('active');
    } else if (tabName === 'todo') {
        document.getElementById('todoView').classList.add('active');
        const btn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.textContent.includes('To-Do'));
        if (btn) btn.classList.add('active');
        fetchTodos();
    } else if (tabName === 'profile') {
        document.getElementById('profileView').classList.add('active');
        const btn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.textContent.includes('Profil'));
        if (btn) btn.classList.add('active');
        updateProfileAvatar();
    } else if (tabName === 'showcase') {
        document.getElementById('showcaseView').classList.add('active');
        const btn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.textContent.includes('Showcase'));
        if (btn) btn.classList.add('active');
        fetchShowcase();
    }
}

function updateProfileAvatar() {
    const avatarImg = document.getElementById('profileAvatarImg');
    const headerAvatar = document.getElementById('headerAvatarImg');
    const heroAvatar = document.getElementById('heroAvatarImg');
    const activeNameEl = document.getElementById('activeAnimalName');
    
    const animalObj = animals.find(a => a.file === currentAvatar) || animals[0];
    
    if (avatarImg) avatarImg.src = `assets/${currentAvatar}`;
    if (headerAvatar) headerAvatar.src = `assets/${currentAvatar}`;
    if (heroAvatar) heroAvatar.src = `assets/${currentAvatar}`;
    if (activeNameEl) activeNameEl.textContent = animalObj.name;
}

// Render Galeri Hewan
const animalGrid = document.getElementById('animalGrid');
function renderAnimals() {
    if (!animalGrid) return;
    animalGrid.innerHTML = animals.map(animal => `
        <div class="animal-card ${currentAvatar === animal.file ? 'selected' : ''}" onclick="selectAvatar('${animal.file}')">
            <img src="assets/${animal.file}" alt="${animal.name}">
            <span>${animal.name}</span>
            ${currentAvatar === animal.file ? '<small class="active-badge">✓ Aktif</small>' : ''}
        </div>
    `).join('');
}

function selectAvatar(filename) {
    currentAvatar = filename;
    localStorage.setItem('userAvatar', filename);
    renderAnimals();
    updateProfileAvatar();
    const animalName = animals.find(a => a.file === filename).name;
    showToast(`✨ Avatar berhasil diubah ke ${animalName}!`);
}

function showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Modal Showcase
function openShowcaseModal() {
    document.getElementById('showcaseModal').style.display = 'flex';
}
function closeShowcaseModal() {
    document.getElementById('showcaseModal').style.display = 'none';
}

function updateFileName(input) {
    const label = document.getElementById('uploadLabel');
    if (input.files && input.files[0]) {
        label.textContent = '📄 ' + input.files[0].name;
    } else {
        label.textContent = 'Klik untuk pilih foto / dokumen proyek';
    }
}

// Date Add Helper
function addDays(days) {
    const input = document.getElementById('dueDate');
    let baseDate = input.value ? new Date(input.value) : new Date();
    
    if (isNaN(baseDate.getTime())) {
        baseDate = new Date();
    }
    
    baseDate.setDate(baseDate.getDate() + days);
    
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    input.value = `${year}-${month}-${day}`;
}

// SUPABASE CONFIG & TO-DO / SHOWCASE LOGIC
const DEFAULT_SUPABASE_URL = 'https://hremnjvcaklvppqyncti.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZW1uanZjYWtsdnBwcXluY3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNDkzMDYsImV4cCI6MjEwNzgyNTMwNn0.7MpiCFGuK8W3YdwOMnLXTU2LerjUBkZX2af3skY3U2E'; 
const TABLE_NAME = 'todos'; 

let SUPABASE_URL = localStorage.getItem('sb_url') || DEFAULT_SUPABASE_URL;
let SUPABASE_ANON_KEY = localStorage.getItem('sb_key') || DEFAULT_SUPABASE_ANON_KEY;

let supabaseClient = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch(e) {
        console.error('Supabase init error:', e);
    }
}

const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const todoList = document.getElementById('todoList');

async function fetchTodos() {
    if (!supabaseClient) {
        todoList.innerHTML = `<li class="todo-item" style="color: #C8794A; justify-content: center; flex-direction: column; gap: 5px; text-align: center;"><span>⚠️ Supabase Anon Key belum diatur.</span></li>`;
        return;
    }

    const { data, error } = await supabaseClient
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching todos:', error);
        todoList.innerHTML = `<li class="todo-item" style="color: #D9534F; justify-content: center;">❌ Error: ${error.message}</li>`;
        return;
    }

    renderTodos(data);
    updateProgress(data);
}

function updateProgress(todos) {
    const pill = document.getElementById('progressPill');
    const countEl = document.getElementById('completedCount');
    if (!todos || todos.length === 0) {
        if (pill) pill.textContent = '0% Selesai';
        if (countEl) countEl.textContent = '0 selesai';
        return;
    }
    const completed = todos.filter(t => t.completed).length;
    const pct = Math.round((completed / todos.length) * 100);
    if (pill) pill.textContent = `${pct}% Selesai`;
    if (countEl) countEl.textContent = `${completed} dari ${todos.length} selesai`;
}

function renderTodos(todos) {
    if (!todos || todos.length === 0) {
        todoList.innerHTML = `<li class="todo-item" style="color: #8A7560; justify-content: center; font-style: italic;">🐾 Belum ada tugas belajar. Santai dulu atau tambah satu!</li>`;
        return;
    }

    todoList.innerHTML = todos.map(todo => {
        let dateBadge = '';
        if (todo.due_date) {
            const dueStr = formatDate(todo.due_date);
            dateBadge = `<span style="font-size: 0.75em; background: #F3EBDD; color: #7D4F28; padding: 2px 8px; border-radius: 6px; font-family: monospace; margin-left: 8px;">⏳ Deadline: ${dueStr}</span>`;
        }

        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
                <span onclick="toggleTodo('${todo.id}', ${todo.completed})" style="cursor: pointer; flex: 1; display: flex; align-items: center; flex-wrap: wrap; gap: 6px;">
                    <span>${todo.completed ? '☑' : '☐'}</span>
                    <span>${escapeHtml(todo.task || '')}</span>
                    ${dateBadge}
                </span>
                <div class="todo-actions">
                    <button class="delete-btn" onclick="deleteTodo('${todo.id}')">Hapus</button>
                </div>
            </li>
        `;
    }).join('');
}

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'short' };
    try {
        return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch(e) {
        return dateString;
    }
}

async function addTodo() {
    const taskText = taskInput.value.trim();
    const dueDate = document.getElementById('dueDate').value || null;

    if (!taskText) return;

    if (!supabaseClient) {
        alert("Konfigurasi Supabase belum lengkap!");
        return;
    }

    const { error } = await supabaseClient
        .from(TABLE_NAME)
        .insert([{ task: taskText, completed: false, due_date: dueDate }]);

    if (error) {
        console.error('Error adding todo:', error);
        alert('Gagal menambah tugas: ' + error.message);
        return;
    }

    taskInput.value = '';
    document.getElementById('dueDate').value = '';
    fetchTodos();
    showToast("✨ Tugas baru berhasil ditambahkan!");
}

async function deleteTodo(id) {
    const { error } = await supabaseClient
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting todo:', error);
        return;
    }

    fetchTodos();
    showToast("🗑️ Tugas dihapus.");
}

async function toggleTodo(id, currentStatus) {
    const { error } = await supabaseClient
        .from(TABLE_NAME)
        .update({ completed: !currentStatus })
        .eq('id', id);

    if (error) {
        console.error('Error updating todo:', error);
        return;
    }

    fetchTodos();
}

// Showcase logic
function fetchShowcase() {
    const showcaseGrid = document.getElementById('showcaseGrid');
    let projects = JSON.parse(localStorage.getItem('showcaseProjects')) || [
        { title: "Paper Doll Base v1", desc: "Membuat karakter dasar modular pixel art 24x24.", fileData: null, fileName: null }
    ];

    showcaseGrid.innerHTML = projects.map((proj, index) => `
        <div class="showcase-card">
            <div>
                ${proj.fileData ? `<div class="showcase-img-preview"><img src="${proj.fileData}" alt="Project File"></div>` : ''}
                <h4 style="font-size: 1.05em; color: #3D2B1F; margin-bottom: 6px;">✨ ${escapeHtml(proj.title)}</h4>
                <p style="font-size: 0.85em; color: #8A7560; line-height: 1.4; margin-bottom: 10px;">${escapeHtml(proj.desc)}</p>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E8DCC8; padding-top: 10px;">
                <span style="font-size: 0.75em; color: #8A7560; font-family: monospace;">${proj.fileName ? escapeHtml(proj.fileName) : 'Tanpa Berkas'}</span>
                <button onclick="deleteShowcase(${index})" style="background: transparent; color: #D9534F; border: none; font-size: 0.8em; cursor: pointer; font-weight: 600;">Hapus</button>
            </div>
        </div>
    `).join('');
}

function addShowcaseProject() {
    const title = document.getElementById('projectTitle').value.trim();
    const desc = document.getElementById('projectDesc').value.trim();
    const fileInput = document.getElementById('projectFile');

    if (!title) {
        alert("Judul proyek tidak boleh kosong!");
        return;
    }

    let projects = JSON.parse(localStorage.getItem('showcaseProjects')) || [];

    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            projects.unshift({
                title,
                desc,
                fileData: e.target.result,
                fileName: file.name
            });
            localStorage.setItem('showcaseProjects', JSON.stringify(projects));
            finishShowcaseAdd();
        };
        
        reader.readAsDataURL(file);
    } else {
        projects.unshift({
            title,
            desc,
            fileData: null,
            fileName: null
        });
        localStorage.setItem('showcaseProjects', JSON.stringify(projects));
        finishShowcaseAdd();
    }
}

function finishShowcaseAdd() {
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDesc').value = '';
    document.getElementById('projectFile').value = '';
    document.getElementById('uploadLabel').textContent = 'Klik untuk pilih foto / dokumen proyek';
    closeShowcaseModal();
    fetchShowcase();
    showToast("🚀 Karya berhasil diabadikan ke Showcase!");
}

function deleteShowcase(index) {
    let projects = JSON.parse(localStorage.getItem('showcaseProjects')) || [];
    projects.splice(index, 1);
    localStorage.setItem('showcaseProjects', JSON.stringify(projects));
    fetchShowcase();
    showToast("🗑️ Proyek dihapus dari Showcase.");
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function openSettings() {
    document.getElementById('modalUrl').value = localStorage.getItem('sb_url') || DEFAULT_SUPABASE_URL;
    document.getElementById('modalKey').value = localStorage.getItem('sb_key') || DEFAULT_SUPABASE_ANON_KEY;
    document.getElementById('settingsModal').style.display = 'flex';
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

function saveSettings() {
    const url = document.getElementById('modalUrl').value.trim();
    const key = document.getElementById('modalKey').value.trim();
    if (url && key) {
        localStorage.setItem('sb_url', url);
        localStorage.setItem('sb_key', key);
        alert('Konfigurasi Supabase berhasil disimpan! Halaman akan dimuat ulang.');
        location.reload();
    } else {
        alert('URL dan Key tidak boleh kosong!');
    }
}

// Global Window Bindings
window.switchTab = switchTab;
window.selectAvatar = selectAvatar;
window.openShowcaseModal = openShowcaseModal;
window.closeShowcaseModal = closeShowcaseModal;
window.addShowcaseProject = addShowcaseProject;
window.deleteShowcase = deleteShowcase;
window.updateFileName = updateFileName;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.addDays = addDays;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.saveSettings = saveSettings;

if (addTaskBtn) addTaskBtn.addEventListener('click', addTodo);
if (taskInput) taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

document.addEventListener('DOMContentLoaded', () => {
    renderAnimals();
    updateProfileAvatar();
    fetchTodos();
    console.log("Mini Pixel Vault (Cozy Café) loaded successfully!");
});
