// 6 Hewan Pixel Art Resmi Buatan Adit
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
let userName = "Aditya Prayoga";

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
        const btn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.textContent.includes('VAULT'));
        if (btn) btn.classList.add('active');
    } else if (tabName === 'todo') {
        document.getElementById('todoView').classList.add('active');
        const btn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.textContent.includes('TO-DO'));
        if (btn) btn.classList.add('active');
        fetchTodos();
    } else if (tabName === 'profile') {
        document.getElementById('profileView').classList.add('active');
        const btn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.textContent.includes('PROFIL'));
        if (btn) btn.classList.add('active');
        updateProfileAvatar();
    } else if (tabName === 'showcase') {
        document.getElementById('showcaseView').classList.add('active');
        const btn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.textContent.includes('SHOWCASE'));
        if (btn) btn.classList.add('active');
        fetchShowcase();
    }
}

function updateProfileAvatar() {
    const avatarImg = document.getElementById('profileAvatarImg');
    if (avatarImg) {
        avatarImg.src = `assets/${currentAvatar}`;
    }
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

// SUPABASE CONFIG & TO-DO / SHOWCASE LOGIC
// Supabase Config via localStorage (Never needs manual code edits!)
const DEFAULT_SUPABASE_URL = 'https://hremnjvcaklvppqyncti.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZW1uanZjYWtsdnBwcXluY3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNDkzMDYsImV4cCI6MjEwNzgyNTMwNn0.7MpiCFGuK8W3YdwOMnLXTU2LerjUBkZX2af3skY3U2E'; // Kamu bisa simpan key asli di sini sekali saja
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
        todoList.innerHTML = `<li class="todo-item" style="color: #666; justify-content: center;">⚠️ Supabase Anon Key perlu disalin ulang di app.js</li>`;
        return;
    }

    const { data, error } = await supabaseClient
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching todos:', error);
        todoList.innerHTML = `<li class="todo-item" style="color: #ff5252; justify-content: center;">❌ Error: ${error.message}</li>`;
        return;
    }

    renderTodos(data);
}

function renderTodos(todos) {
    if (!todos || todos.length === 0) {
        todoList.innerHTML = `<li class="todo-item" style="color: #666; justify-content: center;">Belum ada tugas belajar. Yuk tambah satu!</li>`;
        return;
    }

    todoList.innerHTML = todos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}">
            <span onclick="toggleTodo('${todo.id}', ${todo.completed})" style="cursor: pointer; flex: 1;">
                ${todo.completed ? '☑' : '☐'} ${escapeHtml(todo.task || '')}
            </span>
            <div class="todo-actions">
                <button class="delete-btn" onclick="deleteTodo('${todo.id}')">Hapus</button>
            </div>
        </li>
    `).join('');
}

async function addTodo() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    if (!supabaseClient) {
        alert("Harap isi SUPABASE_URL dan SUPABASE_ANON_KEY dengan benar di app.js!");
        return;
    }

    const { error } = await supabaseClient
        .from(TABLE_NAME)
        .insert([{ task: taskText, completed: false }]);

    if (error) {
        console.error('Error adding todo:', error);
        alert('Gagal menambah tugas: ' + error.message);
        return;
    }

    taskInput.value = '';
    fetchTodos();
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

// Showcase logic with File Upload (FileReader API)
function fetchShowcase() {
    const showcaseGrid = document.getElementById('showcaseGrid');
    let projects = JSON.parse(localStorage.getItem('showcaseProjects')) || [
        { title: "Paper Doll Base v1", desc: "Membuat karakter dasar modular pixel art 24x24.", fileData: null, fileName: null }
    ];

    showcaseGrid.innerHTML = projects.map((proj, index) => `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                ${proj.fileData ? `<div style="margin-bottom: 10px; text-align: center;"><img src="${proj.fileData}" alt="Project File" style="max-width: 100%; height: 120px; object-fit: contain; border-radius: 6px; border: 1px solid #eee; background: #f8fafc; image-rendering: pixelated;"></div>` : ''}
                <h4 style="font-size: 1em; color: #0f172a; margin-bottom: 6px;">✨ ${escapeHtml(proj.title)}</h4>
                <p style="font-size: 0.85em; color: #64748b; line-height: 1.4; margin-bottom: 10px;">${escapeHtml(proj.desc)}</p>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 8px;">
                <span style="font-size: 0.75em; color: #94a3b8; font-family: monospace;">${proj.fileName ? escapeHtml(proj.fileName) : 'Tanpa Berkas'}</span>
                <button onclick="deleteShowcase(${index})" style="background: transparent; color: #ef4444; border: none; font-size: 0.8em; cursor: pointer;">Hapus</button>
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
                fileData: e.target.result, // Base64 data URL
                fileName: file.name
            });
            localStorage.setItem('showcaseProjects', JSON.stringify(projects));
            resetAndRefreshShowcase();
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
        resetAndRefreshShowcase();
    }
}

function resetAndRefreshShowcase() {
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDesc').value = '';
    document.getElementById('projectFile').value = '';
    fetchShowcase();
    alert("Proyek dan berkas berhasil diabadikan ke Showcase!");
}

function deleteShowcase(index) {
    let projects = JSON.parse(localStorage.getItem('showcaseProjects')) || [];
    projects.splice(index, 1);
    localStorage.setItem('showcaseProjects', JSON.stringify(projects));
    fetchShowcase();
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

if (addTaskBtn) addTaskBtn.addEventListener('click', addTodo);
if (taskInput) taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

document.addEventListener('DOMContentLoaded', () => {
    renderAnimals();
    updateProfileAvatar();
    console.log("Mini Pixel Vault & To-Do Dashboard loaded!");
});

function updateFileName(input) {
    const label = document.getElementById('uploadLabel');
    if (input.files && input.files[0]) {
        label.textContent = '📄 Berkas dipilih: ' + input.files[0].name;
    } else {
        label.textContent = 'Klik untuk pilih foto / dokumen proyek';
    }
}

// Explicit window bindings for inline HTML onclick handlers
window.switchTab = switchTab;
window.selectAvatar = selectAvatar;
window.addShowcaseProject = addShowcaseProject;
window.deleteShowcase = deleteShowcase;
window.updateFileName = updateFileName;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
