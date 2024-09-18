console.log('Streaks script loaded');

const streakInput = document.getElementById('streakInput');
const addStreakBtn = document.getElementById('addStreakBtn');
const streakList = document.getElementById('streakList');

let streaks = JSON.parse(localStorage.getItem('streaks')) || [];

function renderStreaks() {
    streakList.innerHTML = '';
    streaks.forEach((streak, index) => {
        const streakItem = document.createElement('div');
        streakItem.classList.add('streak-item');
        streakItem.draggable = true;
        streakItem.dataset.index = index;

        const streakCounter = document.createElement('div');
        streakCounter.classList.add('streak-counter');
        streakCounter.textContent = streak.count;
        streakCounter.addEventListener('click', () => incrementStreak(index));

        const streakText = document.createElement('span');
        streakText.textContent = streak.text;

        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️';
        editBtn.classList.add('edit-streak');
        editBtn.addEventListener('click', () => editStreak(index));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.classList.add('delete-streak');
        deleteBtn.addEventListener('click', () => deleteStreak(index));

        streakItem.appendChild(streakCounter);
        streakItem.appendChild(streakText);
        streakItem.appendChild(editBtn);
        streakItem.appendChild(deleteBtn);

        streakItem.addEventListener('dragstart', dragStart);
        streakItem.addEventListener('dragover', dragOver);
        streakItem.addEventListener('drop', drop);
        streakItem.addEventListener('dragend', dragEnd);

        streakList.appendChild(streakItem);
    });
    saveStreaks();
}

function addStreak() {
    const text = streakInput.value.trim();
    if (text) {
        streaks.push({ text, count: 0 });
        streakInput.value = '';
        renderStreaks();
    }
}

function incrementStreak(index) {
    streaks[index].count++;
    const streakCounter = document.querySelectorAll('.streak-counter')[index];
    streakCounter.classList.add('increment-animation');
    streakCounter.addEventListener('animationend', () => {
        streakCounter.classList.remove('increment-animation');
    });
    renderStreaks();
}

function editStreak(index) {
    const newText = prompt('Edit habit:', streaks[index].text);
    if (newText !== null) {
        streaks[index].text = newText.trim();
        renderStreaks();
    }
}

function deleteStreak(index) {
    if (confirm('Are you sure you want to delete this habit?')) {
        streaks.splice(index, 1);
        renderStreaks();
    }
}

function saveStreaks() {
    localStorage.setItem('streaks', JSON.stringify(streaks));
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
    e.target.classList.add('dragging');
}

function dragOver(e) {
    e.preventDefault();
    const draggingElement = document.querySelector('.dragging');
    const currentElement = e.target.closest('.streak-item');
    if (draggingElement !== currentElement) {
        const container = streakList;
        const afterElement = getDragAfterElement(container, e.clientY);
        if (afterElement == null) {
            container.appendChild(draggingElement);
        } else {
            container.insertBefore(draggingElement, afterElement);
        }
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.streak-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function drop(e) {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const toIndex = parseInt(e.target.closest('.streak-item').dataset.index);
    if (fromIndex !== toIndex) {
        const [movedStreak] = streaks.splice(fromIndex, 1);
        streaks.splice(toIndex, 0, movedStreak);
        renderStreaks();
    }
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

addStreakBtn.addEventListener('click', addStreak);
streakInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addStreak();
    }
});

renderStreaks();