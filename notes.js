
    console.log('Script loaded');

    const taskInput = document.getElementById('noteTitle');
    const contentInput = document.getElementById('noteContent');
    const addTaskBtn = document.getElementById('addNoteBtn');
    const taskList = document.getElementById('noteList');
    
    let tasks = JSON.parse(localStorage.getItem('notes')) || [];
    
    function renderTasks() {
        console.log('Rendering notes');
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note-item', 'fade-in');
            noteElement.innerHTML = `
                <div class="note-title">${task.title}</div>
                <div class="note-content">${task.content}</div>
                <div class="note-actions">
                    <button onclick="editTask(${index})">✏️</button>
                    <button onclick="deleteTask(${index})">🗑️</button>
                </div>
            `;
            taskList.appendChild(noteElement);
        });
        saveTasks();
        updateStats();
    }
    
    function addTask() {
        console.log('addTask function called');
        const title = taskInput.value.trim();
        const content = contentInput.value.trim();
        console.log('Note title:', title);
        console.log('Note content:', content);
        if (title || content) {
            console.log('Creating new note');
            const task = {
                title: title,
                content: content
            };
            tasks.push(task);
            taskInput.value = '';
            contentInput.value = '';
            console.log('Note added, rendering notes');
            renderTasks();
        } else {
            console.log('Note title and content are empty');
        }
    }
    
    function editTask(index) {
        const modal = document.getElementById('editModal');
        const titleInput = document.getElementById('editNoteTitle');
        const contentInput = document.getElementById('editNoteContent');
    
        titleInput.value = tasks[index].title || '';
        contentInput.value = tasks[index].content || '';
    
        modal.style.display = 'block';
    
        window.currentEditIndex = index;
    }
    
    function closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
    }
    
    function saveEditedNote() {
        const index = window.currentEditIndex;
        const newTitle = document.getElementById('editNoteTitle').value.trim();
        const newContent = document.getElementById('editNoteContent').value.trim();
    
        if (newTitle || newContent) {
            tasks[index].title = newTitle;
            tasks[index].content = newContent;
            renderTasks();
            closeEditModal();
        }
    }
    
    function deleteTask(index) {
        if (confirm('Möchten Sie diese Notiz wirklich löschen?')) {
            tasks.splice(index, 1);
            renderTasks();
        }
    }
    
    function saveTasks() {
        localStorage.setItem('notes', JSON.stringify(tasks));
    }
    
    function updateStats() {
        const totalNotes = tasks.length;
        document.getElementById('totalNotes').textContent = totalNotes;
    }
    
    addTaskBtn.addEventListener('click', () => {
        console.log('Add button clicked');
        addTask();
    });
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            console.log('Enter key pressed in task input');
            addTask();
        }
    });
    
    contentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            console.log('Ctrl+Enter pressed in content input');
            addTask();
        }
    });
    
    // Event-Listener für das Schließen des Modals, wenn außerhalb geklickt wird
    window.onclick = function(event) {
        const modal = document.getElementById('editModal');
        if (event.target == modal) {
            closeEditModal();
        }
    }
    
    console.log('Initial render');
    renderTasks();

    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.index);
        e.target.classList.add('dragging');
    }
    
    function dragOver(e) {
        e.preventDefault();
    }
    
    function drop(e) {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const toIndex = parseInt(e.target.closest('.note-item').dataset.index);
        if (fromIndex !== toIndex) {
            const [movedNote] = notes.splice(fromIndex, 1);
            notes.splice(toIndex, 0, movedNote);
            renderNotes();
        }
    }
    
    function dragEnd(e) {
        e.target.classList.remove('dragging');
    }
    
    function renderNotes() {
        noteList.innerHTML = '';
        notes.forEach((note, index) => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note-item', 'fade-in');
            noteElement.draggable = true;
            noteElement.dataset.index = index;
            noteElement.innerHTML = `
                <div class="note-title">${note.title}</div>
                <div class="note-content">${note.content}</div>
                <div class="note-actions">
                    <button onclick="editNote(${index})">✏️</button>
                    <button onclick="deleteNote(${index})">🗑️</button>
                </div>
            `;
            noteElement.addEventListener('dragstart', dragStart);
            noteElement.addEventListener('dragover', dragOver);
            noteElement.addEventListener('drop', drop);
            noteElement.addEventListener('dragend', dragEnd);
            noteList.appendChild(noteElement);
        });
        updateStats();
    }