
document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const newTaskInput = document.getElementById("new-task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const todoTasks = document.getElementById("todo-tasks");
  const doingTasks = document.getElementById("doing-tasks");
  const doneTasks = document.getElementById("done-tasks");
  const todoCount = document.getElementById("todo-count");
  const doingCount = document.getElementById("doing-count");
  const doneCount = document.getElementById("done-count");

  // Initialize tasks from localStorage or empty array
  let tasks = JSON.parse(localStorage.getItem("kanban-tasks")) || [];

  // Render all tasks
  renderAllTasks();

  // Add new task
  addTaskBtn.addEventListener("click", addTask);
  newTaskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addTask();
    }
  });

  // Drag and drop functionality
  setupDragAndDrop();

  function addTask() {
    const taskText = newTaskInput.value.trim();
    if (taskText) {
      const newTask = {
        id: Date.now().toString(),
        text: taskText,
        status: "todo",
        createdAt: new Date().toISOString(),
      };

      tasks.push(newTask);
      saveTasks();
      renderTask(newTask);
      newTaskInput.value = "";
      updateCounts();
    }
  }

  function renderAllTasks() {
    // Clear all columns
    todoTasks.innerHTML = "";
    doingTasks.innerHTML = "";
    doneTasks.innerHTML = "";

    // Render each task in the appropriate column
    tasks.forEach((task) => renderTask(task));
    updateCounts();
  }

  function renderTask(task) {
    const taskElement = createTaskElement(task);

    switch (task.status) {
      case "todo":
        todoTasks.appendChild(taskElement);
        break;
      case "doing":
        doingTasks.appendChild(taskElement);
        break;
      case "done":
        doneTasks.appendChild(taskElement);
        break;
    }
  }

  function createTaskElement(task) {
    const taskElement = document.createElement("div");
    taskElement.className =
      "task-card bg-white p-3 rounded-lg border border-gray-200 cursor-move shadow-sm";
    taskElement.setAttribute("draggable", "true");
    taskElement.setAttribute("data-task-id", task.id);

    // Different border colors based on status
    let borderColor = "border-gray-200";
    if (task.status === "todo") borderColor = "border-red-200";
    else if (task.status === "doing") borderColor = "border-yellow-200";
    else if (task.status === "done") borderColor = "border-green-200";

    taskElement.className = `task-card bg-white p-3 rounded-lg border ${borderColor} cursor-move shadow-sm`;

    taskElement.innerHTML = `
                    <div class="flex justify-between items-start">
                        <p class="text-gray-800">${task.text}</p>
                        <button class="delete-task text-gray-400 hover:text-red-500 transition duration-200">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="mt-2 flex justify-between items-center text-xs text-gray-500">
                        <span>${formatDate(task.createdAt)}</span>
                        <div class="flex space-x-1">
                            ${
                              task.status !== "todo"
                                ? `<button class="move-left text-gray-400 hover:text-blue-500 transition duration-200">
                                    <i class="fas fa-arrow-left"></i>
                                </button>`
                                : ""
                            }
                            ${
                              task.status !== "done"
                                ? `<button class="move-right text-gray-400 hover:text-blue-500 transition duration-200">
                                    <i class="fas fa-arrow-right"></i>
                                </button>`
                                : ""
                            }
                        </div>
                    </div>
                `;

    // Add event listeners for buttons
    const deleteBtn = taskElement.querySelector(".delete-task");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    const moveLeftBtn = taskElement.querySelector(".move-left");
    if (moveLeftBtn) {
      moveLeftBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        moveTaskLeft(task.id);
      });
    }

    const moveRightBtn = taskElement.querySelector(".move-right");
    if (moveRightBtn) {
      moveRightBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        moveTaskRight(task.id);
      });
    }

    return taskElement;
  }

  function deleteTask(taskId) {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    renderAllTasks();
  }

  function moveTaskLeft(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status === "doing") task.status = "todo";
    else if (task.status === "done") task.status = "doing";

    saveTasks();
    renderAllTasks();
  }

  function moveTaskRight(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status === "todo") task.status = "doing";
    else if (task.status === "doing") task.status = "done";

    saveTasks();
    renderAllTasks();
  }

  function updateCounts() {
    const todoTasksCount = tasks.filter(
      (task) => task.status === "todo"
    ).length;
    const doingTasksCount = tasks.filter(
      (task) => task.status === "doing"
    ).length;
    const doneTasksCount = tasks.filter(
      (task) => task.status === "done"
    ).length;

    todoCount.textContent = todoTasksCount;
    doingCount.textContent = doingTasksCount;
    doneCount.textContent = doneTasksCount;
  }

  function saveTasks() {
    localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
  }

  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function setupDragAndDrop() {
    const columns = document.querySelectorAll(".kanban-column");
    const taskElements = document.querySelectorAll(".task-card");

    // Add drag events to each task
    document.addEventListener("dragstart", function (e) {
      if (e.target.classList.contains("task-card")) {
        e.target.classList.add("opacity-50");
        e.dataTransfer.setData("text/plain", e.target.dataset.taskId);
      }
    });

    document.addEventListener("dragend", function (e) {
      if (e.target.classList.contains("task-card")) {
        e.target.classList.remove("opacity-50");
      }
    });

    // Add drag events to each column
    columns.forEach((column) => {
      column.addEventListener("dragover", function (e) {
        e.preventDefault();
        this.classList.add("drag-over");
      });

      column.addEventListener("dragleave", function () {
        this.classList.remove("drag-over");
      });

      column.addEventListener("drop", function (e) {
        e.preventDefault();
        this.classList.remove("drag-over");

        const taskId = e.dataTransfer.getData("text/plain");
        const task = tasks.find((t) => t.id === taskId);

        if (task) {
          const newStatus = this.dataset.status;
          if (task.status !== newStatus) {
            task.status = newStatus;
            saveTasks();
            renderAllTasks();
          }
        }
      });
    });
  }
});
