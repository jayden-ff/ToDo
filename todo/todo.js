console.log('Script loaded');

const taskInput = document.getElementById('taskInput');
const categorySelect = document.getElementById('categorySelect');
const newCategoryInput = document.getElementById('newCategoryInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const darkModeToggle = document.getElementById('darkModeToggle');
const priorityButtons = document.querySelectorAll('.priority-button');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || {};
let selectedPriority = 'low';

function renderTasks() {
    console.log('Rendering tasks');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.classList.add('task-item', 'fade-in');
        li.draggable = true;
        li.dataset.index = index;

        if (task.type === 'heading') {
            li.classList.add('heading');
            li.textContent = task.text;
        } else {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('task-checkbox');
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTask(index));

            const priorityIndicator = document.createElement('span');
            priorityIndicator.classList.add('priority-indicator', `priority-${task.priority}`);

            const taskText = document.createElement('span');
            taskText.classList.add('task-text');
            taskText.textContent = task.text;

            const categorySpan = document.createElement('span');
            categorySpan.classList.add('task-category');
            categorySpan.textContent = task.category || '';
            categorySpan.style.backgroundColor = getCategoryColor(task.category);
            categorySpan.style.color = getContrastColor(getCategoryColor(task.category));
            categorySpan.addEventListener('click', () => changeCategoryColor(task.category));

            const actionsBtn = document.createElement('button');
            actionsBtn.classList.add('task-actions-btn');
            actionsBtn.textContent = '⋮';
            actionsBtn.addEventListener('click', (e) => showActionsMenu(e, index));

            li.appendChild(checkbox);
            li.appendChild(priorityIndicator);
            li.appendChild(taskText);
            li.appendChild(categorySpan);
            li.appendChild(actionsBtn);
        }

        li.addEventListener('dragstart', dragStart);
        li.addEventListener('dragover', dragOver);
        li.addEventListener('drop', drop);
        li.addEventListener('dragend', dragEnd);

        taskList.appendChild(li);
    });
    saveTasks();
    updateStats();
}

function getCategoryColor(category) {
    if (!category) return '#cccccc';
    if (!categories[category]) {
        categories[category] = generateRandomColor();
        saveCategories();
    }
    return categories[category];
}

function generateRandomColor() {
    return `#${Math.floor(Math.random()*16777215).toString(16)}`;
}

function getContrastColor(hexcolor) {
    hexcolor = hexcolor.replace("#", "");
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
}

function changeCategoryColor(category) {
    if (category) {
        const newColor = prompt(`Enter a new color for category "${category}" (e.g., #FF0000 for red):`, categories[category]);
        if (newColor && /^#[0-9A-F]{6}$/i.test(newColor)) {
            categories[category] = newColor;
            saveCategories();
            renderTasks();
        } else if (newColor !== null) {
            alert('Invalid color format. Please use hexadecimal format (e.g., #FF0000).');
        }
    }
}

function addTask() {
    console.log('addTask function called');
    const text = taskInput.value.trim();
    const category = categorySelect.value === 'new' ? newCategoryInput.value.trim() : categorySelect.value;
    console.log('Task text:', text);
    console.log('Category:', category);
    if (text) {
        console.log('Creating new task');
        const task = {
            text: text,
            completed: false,
            type: text.startsWith('#') ? 'heading' : 'task',
            category: category,
            priority: selectedPriority
        };
        if (task.type === 'heading') {
            task.text = task.text.slice(1).trim();
        }
        tasks.push(task);
        taskInput.value = '';
        categorySelect.value = '';
        newCategoryInput.value = '';
        newCategoryInput.style.display = 'none';
        selectedPriority = 'low';
        updatePriorityButtons();
        console.log('Task added, rendering tasks');
        renderTasks();
    } else {
        console.log('Task text is empty');
    }
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    renderTasks();
}

function showActionsMenu(e, index) {
    const menu = document.createElement('div');
    menu.classList.add('task-actions-menu', 'show');

    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️ Edit';
    editBtn.addEventListener('click', () => editTask(index));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.addEventListener('click', () => deleteTask(index));

    const changeCategoryBtn = document.createElement('button');
    changeCategoryBtn.textContent = '🏷️ Change Category';
    changeCategoryBtn.addEventListener('click', () => changeCategory(index));

    const changePriorityBtn = document.createElement('button');
    changePriorityBtn.textContent = '🚨 Change Priority';
    changePriorityBtn.addEventListener('click', () => changePriority(index));

    menu.appendChild(editBtn);
    menu.appendChild(changeCategoryBtn);
    menu.appendChild(changePriorityBtn);
    menu.appendChild(deleteBtn);

    const actionsBtn = e.target;
    actionsBtn.parentNode.appendChild(menu);

    setTimeout(() => {
        document.addEventListener('click', closeActionsMenu);
    }, 0);

    function closeActionsMenu(e) {
        if (!menu.contains(e.target) && e.target !== actionsBtn) {
            menu.remove();
            document.removeEventListener('click', closeActionsMenu);
        }
    }
}

function editTask(index) {
    const newText = prompt('Edit task:', tasks[index].text);
    if (newText !== null) {
        tasks[index].text = newText.trim();
        renderTasks();
    }
}

function changeCategory(index) {
    const newCategory = prompt('Enter new category (or leave blank for no category):');
    if (newCategory !== null) {
        tasks[index].category = newCategory.trim();
        renderTasks();
    }
}

function changePriority(index) {
    const priorities = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(tasks[index].priority);
    const newPriority = priorities[(currentIndex + 1) % priorities.length];
    tasks[index].priority = newPriority;
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}

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
    const toIndex = parseInt(e.target.closest('.task-item').dataset.index);
    if (fromIndex !== toIndex) {
        const [movedTask] = tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, movedTask);
        renderTasks();
    }
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function updateStats() {
    const totalTasks = tasks.filter(task => task.type !== 'heading').length;
    const completedTasks = tasks.filter(task => task.type !== 'heading' && task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
}

function updatePriorityButtons() {
    priorityButtons.forEach(button => {
        button.classList.toggle('selected', button.dataset.priority === selectedPriority);
    });
}

console.log('Add button:', addTaskBtn);
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

darkModeToggle.addEventListener('change', toggleDarkMode);

categorySelect.addEventListener('change', (e) => {
    if (e.target.value === 'new') {
        newCategoryInput.style.display = 'inline-block';
    } else {
        newCategoryInput.style.display = 'none';
    }
});

priorityButtons.forEach(button => {
    button.addEventListener('click', () => {
        selectedPriority = button.dataset.priority;
        updatePriorityButtons();
    });
});

// Initialize dark mode
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
}

console.log('Initial render');
renderTasks();