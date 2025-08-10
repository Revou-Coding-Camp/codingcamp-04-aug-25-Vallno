document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("teks-input");
    const dateInput = document.getElementById("date-input");
    const addTaskBtn = document.getElementById("add-task-btn");
    const taskList = document.getElementById("task-list");
    const progressBar = document.getElementById("progress");
    const progressNumber = document.getElementById("numbers");
    const filterButtons = document.querySelectorAll(".filter-btn");

    let currentFilter = "all";

    const setBodyFilterClass = () => {
        document.body.classList.remove("filter-all", "filter-active", "filter-completed");
        document.body.classList.add(`filter-${currentFilter}`);
    };

    const updateProgress = () => {
        const totalTasks = taskList.children.length;
        const completedTasks = taskList.querySelectorAll(".task-checkbox:checked").length;
        progressBar.style.width = totalTasks ? `${(completedTasks / totalTasks) * 100}%` : "0%";
        progressNumber.textContent = `${completedTasks} / ${totalTasks}`;
        if (totalTasks > 0 && completedTasks === totalTasks) Confetti();
    };

    const saveTaskToLocalStorage = () => {
        const tasks = Array.from(taskList.querySelectorAll('li')).map(li => ({
            text: li.querySelector("span").textContent,
            date: li.querySelector("small")?.textContent || "",
            completed: li.querySelector(".task-checkbox").checked
        }));
        localStorage.setItem("tasks", JSON.stringify(tasks));
    };

    const loadTasksFromLocalStorage = () => {
        const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        savedTasks.forEach(({ text, completed, date }) => addTask(text, completed, false, date));
        updateProgress();
        applyFilter();
    };

    const addTask = (text, completed = false, checkCompletion = true, date = "") => {
        const taskText = text || taskInput.value.trim();
        const taskDate = date || dateInput.value;
        if (!taskText) return;

        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${completed ? 'checked' : ''} />
            <div class="task-info">
                <span>${taskText}</span>
                ${taskDate ? `<small>${taskDate}</small>` : ""}
            </div>
            <div class="task-buttons">
                <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        const checkbox = li.querySelector(".task-checkbox");
        const editBtn = li.querySelector(".edit-btn");

        if (completed) {
            li.classList.add("completed");
            editBtn.style.display = "none";
        }

        checkbox.addEventListener("change", () => {
            li.classList.toggle("completed", checkbox.checked);
            editBtn.style.display = checkbox.checked ? "none" : "inline-flex";
            updateProgress();
            saveTaskToLocalStorage();
            applyFilter();
        });

        editBtn.addEventListener("click", () => {
            if (!checkbox.checked) {
                taskInput.value = li.querySelector("span").textContent;
                dateInput.value = li.querySelector("small")?.textContent || "";
                li.remove();
                updateProgress(false);
                saveTaskToLocalStorage();
            }
        });

        li.querySelector('.delete-btn').addEventListener("click", () => {
            li.remove();
            updateProgress();
            saveTaskToLocalStorage();
            applyFilter();
        });

        taskList.appendChild(li);
        taskInput.value = "";
        dateInput.value = "";
        updateProgress(checkCompletion);
        saveTaskToLocalStorage();
        applyFilter();
    };

    const applyFilter = () => {
        setBodyFilterClass();
        const tasks = taskList.querySelectorAll("li");
        tasks.forEach(task => {
            const checkbox = task.querySelector(".task-checkbox");
            switch (currentFilter) {
                case "all":
                    task.style.display = "flex";
                    checkbox.disabled = false;
                    break;
                case "active":
                    task.style.display = task.classList.contains("completed") ? "none" : "flex";
                    checkbox.disabled = false;
                    break;
                case "completed":
                    task.style.display = task.classList.contains("completed") ? "flex" : "none";
                    checkbox.disabled = true;
                    break;
            }
        });
    };

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            applyFilter();
        });
    });

    addTaskBtn.addEventListener("click", (e) => {
        e.preventDefault();
        addTask();
    });

    taskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTask();
        }
    });

    loadTasksFromLocalStorage();
});

const Confetti = () => {
    const count = 200,
    defaults = { origin: { y: 0.7 } };
    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio),
        }));
    }
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
};
