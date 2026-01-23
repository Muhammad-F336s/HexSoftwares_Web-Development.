// 1. DOM Elements Selectors
const taskInput = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("todo-list");
const noTasksMsg = document.getElementById("no-tasks-msg");
const allCount = document.getElementById("all-count");
const activeCount = document.getElementById("active-count");
const completedCount = document.getElementById("completed-count");
const filterTabs = document.querySelectorAll(".filter-tab");

// Tasks array (Memory)
let tasks = [];
let currentFilter = "all";

// 2. Function: Task Verification (Validation)
function taskVerification() {
  const val = taskInput.value.trim();
  if (val === "") {
    alert("Please enter a task");
    return;
  }
  if (!isNaN(val[0])) {
    alert("Task cannot start with a number");
    taskInput.value = "";
    return;
  }
  checkRepetition(val);
}

// 3. Function: Duplicate Check
function checkRepetition(taskText) {
  const exists = tasks.some(
    (t) => t.text.toLowerCase() === taskText.toLowerCase(),
  );
  if (exists) {
    alert("Task already exists");
  } else {
    addTask(taskText);
  }
}

// 4. Function: Add New Task
function addTask(taskText) {
  const newTask = {
    id: Date.now(), // Unique ID for tracking
    text: taskText,
    completed: false,
  };
  tasks.unshift(newTask); // Naya task list mein sabse upar add hoga
  saveAndRender();
  taskInput.value = "";
}

// 5. Function: Render Tasks (Sorting & Indexing included)
function renderTasks() {
  taskList.innerHTML = "";

  // Sorting logic (Active upar, Completed neeche)
  const sortedTasks = [...tasks].sort((a, b) => a.completed - b.completed);

  const filteredTasks = sortedTasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  filteredTasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `todo-item ${task.completed ? "completed" : ""}`;
    li.setAttribute("draggable", true); // Draggable enable kiya
    li.setAttribute("data-id", task.id); // ID store ki pehchan ke liye

    li.innerHTML = `
            <div class="task-content">
                <span class="task-index">${index + 1}.</span>
                <span class="task-text">${task.text}</span>
            </div>
            <div class="actions">
                <button class="check-btn">${task.completed ? "↩" : "✔"}</button>
                <button class="delete-btn">✖</button>
            </div>
        `;

    // --- Drag and Drop Event Listeners ---
    li.addEventListener("dragstart", () => li.classList.add("dragging"));
    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
      reorderTasksInArray(); // Drop hone ke baad array update karein
    });

    // Delete & Complete Logic (Same as before)
    li.querySelector(".delete-btn").addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      saveAndRender();
    });
    li.querySelector(".check-btn").addEventListener("click", () => {
      task.completed = !task.completed;
      saveAndRender();
    });

    taskList.appendChild(li);
  });

  // List par drop handling
  taskList.addEventListener("dragover", initSortableList);

  updateUI();
}

// 6. Function: Update Counts & Empty Message
function updateUI() {
  allCount.textContent = tasks.length;
  activeCount.textContent = tasks.filter((t) => !t.completed).length;
  completedCount.textContent = tasks.filter((t) => t.completed).length;

  noTasksMsg.style.display = tasks.length === 0 ? "block" : "none";
}

// 7. Function: Save to LocalStorage
function saveAndRender() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

// 8. Event Listeners: Filters
filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    filterTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentFilter = tab.getAttribute("data-filter");
    renderTasks();
  });
});

// Add Task Listeners
addBtn.addEventListener("click", taskVerification);
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") taskVerification();
});

// 9. Initial Load
document.addEventListener("DOMContentLoaded", () => {
  const stored = localStorage.getItem("tasks");
  if (stored) {
    tasks = JSON.parse(stored);
  }
  renderTasks();
});
// 1. Mouse position ke hisab se item ko move karna
const initSortableList = (e) => {
  e.preventDefault();
  const draggingItem = document.querySelector(".dragging");
  // Baqi items nikalna jo drag nahi ho rahe
  let siblings = [...taskList.querySelectorAll(".todo-item:not(.dragging)")];

  // Find the next sibling after which we should place the dragging item
  let nextSibling = siblings.find((sibling) => {
    return e.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
  });

  taskList.insertBefore(draggingItem, nextSibling);
};

// 2. DOM ki nayi tarteeb ko 'tasks' array mein save karna
function reorderTasksInArray() {
  const newOrder = [];
  const items = taskList.querySelectorAll(".todo-item");

  items.forEach((item) => {
    const id = parseInt(item.getAttribute("data-id"));
    const taskObj = tasks.find((t) => t.id === id);
    newOrder.push(taskObj);
  });

  tasks = newOrder; // Memory mein array update kiya
  saveAndRender(); // LocalStorage mein save kiya aur numbers update kiye
}
// --- Mobile Touch Events ---
li.addEventListener(
  "touchstart",
  (e) => {
    // Sirf tab drag ho jab user index ya text par touch kare (buttons par nahi)
    if (e.target.tagName !== "BUTTON") {
      li.classList.add("dragging");
    }
  },
  { passive: true },
);

li.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault(); // Screen scroll hone se rokne ke liye
    const touch = e.touches[0];
    const draggingItem = document.querySelector(".dragging");

    // Touch position ke hisab se element dhoondna
    const targetElement = document.elementFromPoint(
      touch.clientX,
      touch.clientY,
    );
    const closestLi = targetElement?.closest(".todo-item");

    if (closestLi && closestLi !== draggingItem) {
      const rect = closestLi.getBoundingClientRect();
      const next = (touch.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
      taskList.insertBefore(
        draggingItem,
        next ? closestLi.nextSibling : closestLi,
      );
    }
  },
  { passive: false },
);

li.addEventListener("touchend", () => {
  li.classList.remove("dragging");
  reorderTasksInArray(); // Tarteeeb save karein
});
