
console.log("Welcome to StudyFlow!");

// ========================================
// 1. LOAD SAVED DATA
// ========================================

let tasks = JSON.parse(localStorage.getItem("studyFlowTasks")) || [];
let studySessions = JSON.parse(localStorage.getItem("studyFlowSessions")) || [];
let subjects = JSON.parse(localStorage.getItem("studyFlowSubjects")) || [];


// ========================================
// 2. SAVE DATA
// ========================================

function saveTasks() {
    localStorage.setItem("studyFlowTasks", JSON.stringify(tasks));
}

function saveStudySessions() {
    localStorage.setItem("studyFlowSessions", JSON.stringify(studySessions));
}

function saveSubjects() {
    localStorage.setItem("studyFlowSubjects", JSON.stringify(subjects));
}


// ========================================
// 3. DATE HELPERS
// ========================================

function getLocalDateString(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function displayTodayDate() {
    let today = new Date();

    document.getElementById("todayDate").textContent =
        today.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
}


// ========================================
// 4. DISPLAY TASKS AND DASHBOARD
// ========================================

function displayTasks() {
    let taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    let searchText = document.getElementById("searchTask").value.toLowerCase();
    let selectedSubject = document.getElementById("filterSubject").value;
    let selectedStatus = document.getElementById("filterStatus").value;

    let totalTasks = tasks.length;

    let completedTasks = tasks.filter(function(task) {
        return task.completed;
    }).length;

    let pendingTasks = totalTasks - completedTasks;

    document.getElementById("totalTasks").textContent = totalTasks;
    document.getElementById("completedTasks").textContent = completedTasks;
    document.getElementById("pendingTasks").textContent = pendingTasks;

    displayUpcomingDeadlines();
    displayCompletedTasks();
    displayStudyProgress();

    tasks.forEach(function(task, index) {

        if (!(task.text || "").toLowerCase().includes(searchText)) {
            return;
        }

        if (selectedSubject !== "" && task.subject !== selectedSubject) {
            return;
        }

        if (selectedStatus === "completed" && !task.completed) {
            return;
        }

        if (selectedStatus === "pending" && task.completed) {
            return;
        }

        let newTask = document.createElement("li");

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!task.completed;

        let taskLabel = document.createElement("span");
        taskLabel.textContent = task.text;

        let subjectLabel = document.createElement("small");
        subjectLabel.textContent = " (" + (task.subject || "No subject") + ")";

        if (task.completed) {
            taskLabel.style.textDecoration = "line-through";
            taskLabel.style.color = "gray";
        }

        checkbox.addEventListener("change", function() {
            tasks[index].completed = checkbox.checked;
            saveTasks();
            displayTasks();
        });

        let dueDateLabel = document.createElement("small");
        dueDateLabel.textContent = " | Due: " + (task.dueDate || "Not set");

        let editButton = document.createElement("button");
        editButton.textContent = "Edit";

        editButton.onclick = function() {
            let updatedTask = prompt("Edit your task:", task.text);

            if (updatedTask === null || updatedTask.trim() === "") {
                return;
            }

            let updatedSubject = prompt("Edit subject:", task.subject || "");

            if (updatedSubject === null || updatedSubject.trim() === "") {
                return;
            }

            let updatedDueDate = prompt(
                "Edit due date (YYYY-MM-DD):",
                task.dueDate || ""
            );

            if (updatedDueDate === null || updatedDueDate.trim() === "") {
                return;
            }

            tasks[index].text = updatedTask.trim();
            tasks[index].subject = updatedSubject.trim();
            tasks[index].dueDate = updatedDueDate.trim();

            saveTasks();
            displayTasks();
        };

        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.onclick = function() {
            if (!confirm("Are you sure you want to delete this task?")) {
                return;
            }

            tasks.splice(index, 1);
            saveTasks();
            displayTasks();
        };

        newTask.appendChild(checkbox);
        newTask.appendChild(taskLabel);
        newTask.appendChild(subjectLabel);
        newTask.appendChild(dueDateLabel);
        newTask.appendChild(editButton);
        newTask.appendChild(deleteButton);

        taskList.appendChild(newTask);
    });

    displayWeeklyChart();
    displayCalendar();
}


// ========================================
// 5. ADD A NEW TASK
// ========================================

function addTask() {
    let taskInput = document.getElementById("taskInput");
    let taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    let subjectInput = document.getElementById("subjectInput");
    let subjectName = subjectInput.value;

    if (subjectName === "") {
        alert("Please choose a subject!");
        return;
    }

    let dueDateInput = document.getElementById("dueDateInput");
    let dueDate = dueDateInput.value;

    if (dueDate === "") {
        alert("Please choose a due date!");
        return;
    }

    tasks.push({
        text: taskText,
        subject: subjectName,
        dueDate: dueDate,
        completed: false
    });

    saveTasks();

    taskInput.value = "";
    subjectInput.value = "";
    dueDateInput.value = "";

    displayTasks();
}


// ========================================
// 6. DISPLAY DAILY STUDY TIMETABLE
// ========================================

function displayStudySessions() {
    let sessionList = document.getElementById("studySessionList");
    sessionList.innerHTML = "";

    studySessions.forEach(function(session, index) {
        let newSession = document.createElement("li");

        newSession.textContent =
            session.subject + " | " +
            session.date + " | " +
            session.start + " to " +
            session.end;

        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.onclick = function() {
            studySessions.splice(index, 1);
            saveStudySessions();
            displayStudySessions();
            displayWeeklyChart();
            displayCalendar();
        };

        newSession.appendChild(deleteButton);
        sessionList.appendChild(newSession);
    });

    displayWeeklyChart();
    displayCalendar();
}


// ========================================
// 7. ADD A STUDY SESSION
// ========================================

function addStudySession() {
    let subject = document.getElementById("studySubject").value.trim();
    let date = document.getElementById("studyDate").value;
    let start = document.getElementById("startTime").value;
    let end = document.getElementById("endTime").value;

    if (subject === "" || date === "" || start === "" || end === "") {
        alert("Please fill in all timetable fields!");
        return;
    }

    if (end <= start) {
        alert("End time must be later than start time!");
        return;
    }

    studySessions.push({
        subject: subject,
        date: date,
        start: start,
        end: end
    });

    saveStudySessions();

    document.getElementById("studySubject").value = "";
    document.getElementById("studyDate").value = "";
    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";

    displayStudySessions();
}


// ========================================
// 8. DISPLAY AND MANAGE SUBJECTS
// ========================================

function displaySubjects() {
    let subjectList = document.getElementById("subjectList");
    subjectList.innerHTML = "";

    let taskSubjectInput = document.getElementById("subjectInput");
    taskSubjectInput.innerHTML = '<option value="">Choose a subject</option>';

    subjects.forEach(function(subject) {
        let option = document.createElement("option");
        option.value = subject;
        option.textContent = subject;
        taskSubjectInput.appendChild(option);
    });

    let filterSubject = document.getElementById("filterSubject");
    filterSubject.innerHTML = '<option value="">All Subjects</option>';

    subjects.forEach(function(subject) {
        let option = document.createElement("option");
        option.value = subject;
        option.textContent = subject;
        filterSubject.appendChild(option);
    });

    subjects.forEach(function(subject, index) {
        let newSubjectItem = document.createElement("li");
        newSubjectItem.textContent = subject;

        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.onclick = function() {
            if (!confirm("Delete this subject from your subject list?")) {
                return;
            }

            subjects.splice(index, 1);
            saveSubjects();
            displaySubjects();
            displayTasks();
        };

        newSubjectItem.appendChild(deleteButton);
        subjectList.appendChild(newSubjectItem);
    });
}


// ========================================
// 9. ADD A NEW SUBJECT
// ========================================

function addSubject() {
    let subjectInput = document.getElementById("newSubject");
    let subjectName = subjectInput.value.trim();

    if (subjectName === "") {
        alert("Please enter a subject name!");
        return;
    }

    if (subjects.some(function(subject) {
        return subject.toLowerCase() === subjectName.toLowerCase();
    })) {
        alert("This subject already exists!");
        return;
    }

    subjects.push(subjectName);

    saveSubjects();

    subjectInput.value = "";

    displaySubjects();
}


// ========================================
// 10. UPCOMING DEADLINES
// ========================================

function displayUpcomingDeadlines() {
    let deadlineList = document.getElementById("upcomingDeadlines");
    deadlineList.innerHTML = "";

    let today = getLocalDateString(new Date());

    let upcomingTasks = tasks.filter(function(task) {
        return !task.completed && task.dueDate;
    });

    upcomingTasks.sort(function(a, b) {
        return a.dueDate.localeCompare(b.dueDate);
    });

    if (upcomingTasks.length === 0) {
        let message = document.createElement("li");
        message.textContent = "No upcoming deadlines.";
        deadlineList.appendChild(message);
        return;
    }

    upcomingTasks.forEach(function(task) {
        let item = document.createElement("li");
        let status = "";

        if (task.dueDate < today) {
            status = "OVERDUE";
            item.className = "deadline-overdue";
        } else if (task.dueDate === today) {
            status = "DUE TODAY";
            item.className = "deadline-today";
        } else {
            status = "UPCOMING";
            item.className = "deadline-upcoming";
        }

        item.textContent =
            task.text + " | " +
            task.dueDate + " | " +
            status;

        deadlineList.appendChild(item);
    });
}


// ========================================
// 11. COMPLETED TASKS
// ========================================

function displayCompletedTasks() {
    let completedTaskList = document.getElementById("completedTaskList");
    completedTaskList.innerHTML = "";

    let completedTasks = tasks.filter(function(task) {
        return task.completed;
    });

    if (completedTasks.length === 0) {
        let message = document.createElement("li");
        message.textContent = "No completed tasks yet.";
        completedTaskList.appendChild(message);
        return;
    }

    completedTasks.forEach(function(task) {
        let item = document.createElement("li");

        item.textContent =
            task.text + " (" + (task.subject || "No subject") + ")";

        completedTaskList.appendChild(item);
    });
}


// ========================================
// 12. STUDY PROGRESS
// ========================================

function displayStudyProgress() {
    let totalTasks = tasks.length;

    let completedTasks = tasks.filter(function(task) {
        return task.completed;
    }).length;

    let percentage = totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    document.getElementById("progressPercentage").textContent =
        percentage + "%";

    document.getElementById("progressFill").style.width =
        percentage + "%";

    document.getElementById("progressDetails").textContent =
        completedTasks + " out of " + totalTasks + " tasks completed.";

    document.getElementById("progressCircle").style.background =
        "conic-gradient(#c58a9b " + percentage +
        "%, #f7e9eb " + percentage + "%)";
}


// ========================================
// 13. WEEKLY PRODUCTIVITY CHART
// ========================================

function displayWeeklyChart() {
    let chart = document.getElementById("weeklyChart");
    chart.innerHTML = "";

    let today = new Date();
    let weekDays = [];

    for (let i = 6; i >= 0; i--) {
        let date = new Date(today);
        date.setDate(today.getDate() - i);

        let dateString = getLocalDateString(date);

        let sessionCount = studySessions.filter(function(session) {
            return session.date === dateString;
        }).length;

        weekDays.push({
            name: date.toLocaleDateString("en-IN", { weekday: "short" }),
            count: sessionCount
        });
    }

    let maximum = Math.max(
        1,
        ...weekDays.map(function(day) {
            return day.count;
        })
    );

    weekDays.forEach(function(day) {
        let dayColumn = document.createElement("div");
        dayColumn.className = "chart-day";

        let count = document.createElement("strong");
        count.textContent = day.count;

        let barArea = document.createElement("div");
        barArea.className = "chart-bar-area";

        let bar = document.createElement("div");
        bar.className = "chart-bar";

        bar.style.height = (day.count / maximum * 100) + "%";

        let dayName = document.createElement("span");
        dayName.textContent = day.name;

        barArea.appendChild(bar);

        dayColumn.appendChild(count);
        dayColumn.appendChild(barArea);
        dayColumn.appendChild(dayName);

        chart.appendChild(dayColumn);
    });
}


// ========================================
// 14. INTERACTIVE STUDY CALENDAR
// ========================================

let calendarDate = new Date();
let selectedCalendarDate = getLocalDateString(new Date());

function displayCalendar() {
    let calendar = document.getElementById("studyCalendar");
    calendar.innerHTML = "";

    let year = calendarDate.getFullYear();
    let month = calendarDate.getMonth();

    let firstDay = new Date(year, month, 1).getDay();
    let numberOfDays = new Date(year, month + 1, 0).getDate();

    let header = document.createElement("div");
    header.className = "calendar-header";

    let previousButton = document.createElement("button");
    previousButton.textContent = "‹";

    previousButton.onclick = function() {
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        displayCalendar();
    };

    let monthTitle = document.createElement("h3");
    monthTitle.textContent = calendarDate.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });

    let nextButton = document.createElement("button");
    nextButton.textContent = "›";

    nextButton.onclick = function() {
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        displayCalendar();
    };

    header.appendChild(previousButton);
    header.appendChild(monthTitle);
    header.appendChild(nextButton);

    calendar.appendChild(header);

    let grid = document.createElement("div");
    grid.className = "calendar-grid";

    let weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    weekdays.forEach(function(day) {
        let heading = document.createElement("div");
        heading.className = "calendar-weekday";
        heading.textContent = day;
        grid.appendChild(heading);
    });

    for (let i = 0; i < firstDay; i++) {
        let empty = document.createElement("div");
        empty.className = "calendar-empty";
        grid.appendChild(empty);
    }

    let todayString = getLocalDateString(new Date());

    for (let day = 1; day <= numberOfDays; day++) {
        let date = new Date(year, month, day);
        let dateString = getLocalDateString(date);

        let hasTask = tasks.some(function(task) {
            return task.dueDate === dateString;
        });

        let hasSession = studySessions.some(function(session) {
            return session.date === dateString;
        });

        let dayButton = document.createElement("button");
        dayButton.className = "calendar-day";
        dayButton.textContent = day;

        if (dateString === todayString) {
            dayButton.classList.add("today");
        }

        if (hasTask || hasSession) {
            dayButton.classList.add("has-event");
        }

        if (dateString === selectedCalendarDate) {
            dayButton.classList.add("selected");
        }

        dayButton.onclick = function() {
            selectedCalendarDate = dateString;
            displayCalendar();
        };

        grid.appendChild(dayButton);
    }

    calendar.appendChild(grid);

    let selectedInfo = document.createElement("div");
    selectedInfo.className = "calendar-selected-date";

    let selectedTasks = tasks.filter(function(task) {
        return task.dueDate === selectedCalendarDate;
    });

    let selectedSessions = studySessions.filter(function(session) {
        return session.date === selectedCalendarDate;
    });

    selectedInfo.textContent =
        selectedCalendarDate +
        " | " + selectedTasks.length + " task(s)" +
        " | " + selectedSessions.length + " study session(s)";

    calendar.appendChild(selectedInfo);
}


// ========================================
// 15. POMODORO FOCUS TIMER
// ========================================

let timerSeconds = 25 * 60;
let timerInterval = null;
let timerRunning = false;
let currentTimerMode = "study";

function updateTimerDisplay() {
    let minutes = Math.floor(timerSeconds / 60);
    let seconds = timerSeconds % 60;

    document.getElementById("timerDisplay").textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}

function startTimer() {
    if (timerRunning) {
        return;
    }

    timerRunning = true;

    timerInterval = setInterval(function() {
        timerSeconds--;

        updateTimerDisplay();

        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerRunning = false;

            if (currentTimerMode === "study") {
                alert("Great work! Time for a short break.");

                currentTimerMode = "break";
                timerSeconds = 5 * 60;

                document.getElementById("timerMode").textContent =
                    "Short Break";
            } else {
                alert("Your break is over. Ready to study again?");

                currentTimerMode = "study";
                timerSeconds = 25 * 60;

                document.getElementById("timerMode").textContent =
                    "Study Session";
            }

            updateTimerDisplay();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning = false;
}

function resetTimer() {
    pauseTimer();

    currentTimerMode = "study";
    timerSeconds = 25 * 60;

    document.getElementById("timerMode").textContent =
        "Study Session";

    updateTimerDisplay();
}


// ========================================
// 16. SEARCH AND FILTERS
// ========================================

document.getElementById("searchTask").addEventListener(
    "input",
    displayTasks
);

document.getElementById("filterSubject").addEventListener(
    "change",
    displayTasks
);

document.getElementById("filterStatus").addEventListener(
    "change",
    displayTasks
);


// ========================================
// 17. DOWNLOAD BACKUP
// ========================================

function downloadBackup() {
    let backupData = {
        tasks: tasks,
        subjects: subjects,
        studySessions: studySessions
    };

    let backupFile = new Blob(
        [JSON.stringify(backupData, null, 4)],
        { type: "application/json" }
    );

    let downloadLink = document.createElement("a");

    downloadLink.href = URL.createObjectURL(backupFile);
    downloadLink.download = "StudyFlow-Backup.json";

    downloadLink.click();

    URL.revokeObjectURL(downloadLink.href);

    alert("Your StudyFlow backup has been downloaded!");
}


// ========================================
// 18. RESTORE BACKUP
// ========================================

function restoreBackup() {
    let fileInput = document.getElementById("backupFile");
    let file = fileInput.files[0];

    if (!file) {
        alert("Please select a backup file first!");
        return;
    }

    let reader = new FileReader();

    reader.onload = function(event) {
        try {
            let backupData = JSON.parse(event.target.result);

            if (
                !backupData ||
                !Array.isArray(backupData.tasks) ||
                !Array.isArray(backupData.subjects) ||
                !Array.isArray(backupData.studySessions)
            ) {
                alert("This is not a valid StudyFlow backup file.");
                return;
            }

            let confirmation = confirm(
                "Restoring this backup will replace your current tasks, subjects and timetable. Continue?"
            );

            if (!confirmation) {
                return;
            }

            tasks = backupData.tasks;
            subjects = backupData.subjects;
            studySessions = backupData.studySessions;

            saveTasks();
            saveSubjects();
            saveStudySessions();

            displaySubjects();
            displayTasks();
            displayStudySessions();

            alert("Your StudyFlow backup has been restored successfully!");

            fileInput.value = "";

        } catch (error) {
            alert("Unable to read this backup file. Please select a valid file.");
        }
    };

    reader.readAsText(file);
}


// ========================================
// 19. CONNECT POMODORO BUTTONS
// ========================================

document.getElementById("startTimer").addEventListener(
    "click",
    startTimer
);

document.getElementById("pauseTimer").addEventListener(
    "click",
    pauseTimer
);

document.getElementById("resetTimer").addEventListener(
    "click",
    resetTimer
);


// ========================================
// 20. LOAD EVERYTHING WHEN WEBSITE OPENS
// ========================================

displayTodayDate();
displaySubjects();
displayTasks();
displayStudySessions();
updateTimerDisplay();
