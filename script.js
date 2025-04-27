document.addEventListener('DOMContentLoaded', () => {
  let tasks = [];
  let currentFilter = 'all';

  // DOM elements
  const openPopupBtn = document.getElementById('openPopupBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const doneBtn = document.getElementById('doneBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const toggle = document.getElementById('toggleTheme');
  const filterBtns = document.querySelectorAll('.filters button');
  const tasksContainer = document.getElementById('tasks');
  const currentTimeEl = document.getElementById('currentTime');
  const progressEl = document.getElementById('progress');

  // Theme toggle
  if (toggle) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark', savedTheme === 'dark');
    toggle.checked = savedTheme === 'dark';
    toggle.addEventListener('change', () => {
      document.body.classList.toggle('dark', toggle.checked);
      localStorage.setItem('theme', toggle.checked ? 'dark' : 'light');
    });
  }

  // Filters
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.filters button.active').classList.remove('active');
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // Clock
  const updateClock = () => {
    const now = new Date();
    currentTimeEl.innerText = `it’s ${now.toLocaleString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })} right now.`;
  };
  setInterval(updateClock, 1000);
  updateClock();

  // Popup controls
  openPopupBtn.addEventListener('click', () => document.getElementById('popup').style.display = 'flex');
  cancelBtn.addEventListener('click', () => document.getElementById('popup').style.display = 'none');

  // Task operations
  doneBtn.addEventListener('click', () => {
    const name = document.getElementById('taskName').value.trim();
    const date = document.getElementById('taskDate').value;
    const time = document.getElementById('taskTime').value;
    if (!name || !date || !time) return alert('Fill all fields!');
    tasks.push({ id: Date.now(), name, date, time, completed: false });
    document.getElementById('popup').style.display = 'none';
    document.getElementById('taskName').value = '';
    document.getElementById('taskDate').value = '';
    document.getElementById('taskTime').value = '';
    renderTasks();
  });
  clearAllBtn.addEventListener('click', () => {
    if (confirm('Clear all tasks?')) {
      tasks = [];
      renderTasks();
    }
  });

  const formatTime = t => {
    let [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${String(m).padStart(2,'0')} ${ampm}`;
  };
  const formatDate = d => {
    const todayStr = new Date().toDateString();
    const selStr = new Date(d).toDateString();
    return todayStr === selStr
      ? 'Today'
      : new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const renderTasks = () => {
    tasksContainer.innerHTML = '';
    tasks
      .filter(t => currentFilter === 'all'
        || (currentFilter === 'completed' && t.completed)
        || (currentFilter === 'pending' && !t.completed))
      .forEach(task => {
        const div = document.createElement('div');
        div.className = 'task-item' + (task.completed ? ' completed' : '');
        if (new Date(task.date).toDateString() === new Date().toDateString()) {
          div.style.backgroundColor = 'var(--highlight)';
        }
        div.innerHTML = `
          <input type="checkbox" ${task.completed ? 'checked' : ''} />
          <label>${task.name}</label>
          <div class="task-time"><span>${formatTime(task.time)}</span><span>${formatDate(task.date)}</span></div>
          <button class="delete-btn">delete</button>
        `;
        // Bind item events
        const checkbox = div.querySelector('input[type="checkbox"]');
        const label = div.querySelector('label');
        const timeDiv = div.querySelector('.task-time');
        const delBtn = div.querySelector('.delete-btn');

        checkbox.addEventListener('change', () => {
          task.completed = checkbox.checked;
          renderTasks();
        });
        label.addEventListener('dblclick', () => {
          const newName = prompt('Edit task name', task.name);
          if (newName) {
            task.name = newName;
            renderTasks();
          }
        });
        timeDiv.addEventListener('click', () => {
          const newTime = prompt('New time (HH:MM)', task.time);
          const newDate = prompt('New date (YYYY-MM-DD)', task.date);
          if (newTime && newDate) {
            task.time = newTime; task.date = newDate;
            renderTasks();
          }
        });
        delBtn.addEventListener('click', () => {
          tasks = tasks.filter(t => t.id !== task.id);
          renderTasks();
        });

        tasksContainer.appendChild(div);
      });
    progressEl.innerText = `${tasks.filter(t => t.completed).length} of ${tasks.length} completed`;
  };

  // Initial render
  renderTasks();
});
