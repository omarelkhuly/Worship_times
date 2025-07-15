const weekData = [
    { day: "السبت", start: "05:00", end: "22:00" },
    { day: "الأحد", start: "05:00", end: "22:00" },
    { day: "الإثنين", start: "05:00", end: "22:00" },
    { day: "الثلاثاء", start: "05:00", end: "22:00" },
    { day: "الأربعاء", start: "05:00", end: "22:00" },
    { day: "الخميس", start: "05:00", end: "22:00" },
    { day: "الجمعة", start: "05:00", end: "22:00" },
];

const topics = [
    "الصلاة في وقتها", "السنن", "صلاة الفجر", "ختم الصلاة",
    "أذكار الصباح والمساء", "صلاة الضحى", "قيام الليل", "الإستغفار",
    "الذكر", "قراءة القرآن الكريم", "الدعاء", "أذكار النوم",
    "سورة تبارك", "سورة الكهف"
];

let noteIndex = ""; // To store the ID of the note being edited

function formatTime(timeStr) {
    const [h, m] = timeStr.split(":");
    return `${h}:${m}`;
}

// Function to load the planner table, restoring from localStorage if data exists for the current week
function loadTable(data = null) {
    const tbody = document.getElementById("planner-body");
    tbody.innerHTML = "";
    const currentWeekData = data || JSON.parse(localStorage.getItem("currentWeekPlanner")) || {};
    for (let i = 0; i < weekData.length; i++) {
        const day = weekData[i];
        let row = `<tr><td>${day.day}</td><td>من ${formatTime(day.start)} إلى ${formatTime(day.end)}</td>`;
        for (let j = 0; j < topics.length; j++) {
            const checkboxId = `check${i}_${j}`;
            const noteId = `noteText${i}_${j}`;
            const savedChecked = currentWeekData[checkboxId] ? "checked" : "";
            const savedNotes = currentWeekData[noteId] || "لا توجد ملاحظات بعد";
            row += `
            <td>
              <input type="checkbox" class="form-check-input checkbox_style" id="${checkboxId}" ${savedChecked}>
              <div id="${noteId}" class="note-text text-muted small mt-1">${savedNotes}</div>
              <button class="btn btn-outline-primary btn-sm mt-1" onclick="openModal('${noteId}')">✏️</button>
            </td>`;
        }
        row += "</tr>";
        tbody.innerHTML += row;
    }
}

// Function to open the note modal
function openModal(noteId) {
    noteIndex = noteId;
    const noteBox = document.getElementById(noteId);
    const existingNotes = Array.from(noteBox.querySelectorAll('.note-content')).map(span => span.dataset.fullNote).join('\n');
    document.getElementById("modalNoteInput").value = existingNotes;
    new bootstrap.Modal(document.getElementById("noteModal")).show();
}

// Function to save a note
function saveNote() {
    const text = document.getElementById("modalNoteInput").value.trim();
    if (!text || noteIndex === null) return;
    const noteBox = document.getElementById(noteIndex); // ✅ تعديل هنا

    if (!noteBox) {
        console.error(`noteBox not found for noteIndex: ${noteIndex}`);
        return;
    }

    if (noteBox.innerText.trim() === "لا توجد ملاحظات بعد") {
        noteBox.innerHTML = "";
    }

    const oldNotes = noteBox.querySelectorAll('.note-content');
    oldNotes.forEach(note => {
        note.classList.remove('text-success');
        note.classList.add('text-danger');
    });

    const newNote = document.createElement("span");
    newNote.className = "d-block text-success note-content d-flex justify-content-between align-items-center mt-1";
    newNote.dataset.fullNote = text; // ✅ مهم جداً لحفظ الملاحظة
    newNote.innerHTML = `
        <span>${text}</span>
        <button class="btn btn-sm btn-danger py-0 px-2" onclick="removeNote(this)">🗑️</button>
    `;
    noteBox.appendChild(newNote);
    bootstrap.Modal.getInstance(document.getElementById("noteModal")).hide();
    document.getElementById("modalNoteInput").value = "";
}

function removeNote(buttonElement) {
    const noteSpan = buttonElement.closest('.note-content');
    const noteBox = noteSpan.parentElement;
    noteSpan.remove();
    if (!noteBox.querySelector('.note-content')) {
        noteBox.innerHTML = 'لا توجد ملاحظات بعد';
    }
}

// Function to save the current week's data to local storage
function saveWeek() {
    const currentWeekData = {};
    for (let i = 0; i < weekData.length; i++) {
        for (let j = 0; j < topics.length; j++) {
            const checkboxId = `check${i}_${j}`;
            const noteId = `noteText${i}_${j}`;
            const checkbox = document.getElementById(checkboxId);
            const noteBox = document.getElementById(noteId);

            if (checkbox) {
                currentWeekData[checkboxId] = checkbox.checked;
            }
            if (noteBox) {
                const notes = Array.from(noteBox.querySelectorAll('.note-content')).map(span => span.dataset.fullNote);
                currentWeekData[noteId] = notes.length > 0 ? notes.join('\n') : "لا توجد ملاحظات بعد";
            }
        }
    }
    localStorage.setItem("currentWeekPlanner", JSON.stringify(currentWeekData));

    // Save as a historical report
    const savedReports = JSON.parse(localStorage.getItem("weeklyReports")) || [];
    const reportDate = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    savedReports.push({
        date: reportDate,
        data: currentWeekData
    });
    localStorage.setItem("weeklyReports", JSON.stringify(savedReports));
    updateReportSelect(); // Update the dropdown with the new report
    alert("تم حفظ الأسبوع بنجاح!");
}

// Function to display results/reports
function showResults() {
    const resultsContainer = document.getElementById("resultsContainer");
    resultsContainer.style.display = "block";
    displayAllReports();
}

// Function to start a new week (clear UI, keep localStorage data)
function startNewWeek() {
    if (confirm("هل أنت متأكد أنك تريد بدء أسبوع جديد؟ سيتم مسح البيانات من الواجهة الحالية فقط.")) {
        localStorage.removeItem("currentWeekPlanner"); // Clear current week data from local storage
        loadTable(); // Reload an empty table
        document.getElementById("resultsContainer").style.display = "none"; // Hide results
    }
}

// Function to get the current week's dates
function getWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek); // Adjust to start of the week (Sunday)

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        weekDates.push(date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }
    return weekDates;
}

// Function to display all saved reports
function displayAllReports() {
    const reportsList = document.getElementById("reportsList");
    reportsList.innerHTML = "";
    const savedReports = JSON.parse(localStorage.getItem("weeklyReports")) || [];

    if (savedReports.length === 0) {
        reportsList.innerHTML = "<p class='text-center text-muted'>لا توجد تقارير محفوظة بعد.</p>";
        return;
    }

    savedReports.forEach((report, index) => {
        const reportDiv = document.createElement("div");
        reportDiv.classList.add("card", "mb-4", "p-3");
        reportDiv.innerHTML = `<h5 class="card-title text-primary">تقرير الأسبوع بتاريخ: ${report.date}</h5>`;

        const reportTable = document.createElement("table");
        reportTable.classList.add("table", "table-bordered", "table-sm");
        let tableHTML = `
          <thead>
            <tr>
              <th>اليوم</th>
              <th>التاريخ</th>
              ${topics.map(topic => `<th>${topic}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
        `;

        const weekDates = getWeekDates(); // Get the current week's dates for display

        for (let i = 0; i < weekData.length; i++) {
            tableHTML += `<tr><td>${weekData[i].day}</td><td>${weekDates[i]}</td>`;
            for (let j = 0; j < topics.length; j++) {
                const checkboxId = `check${i}_${j}`;
                const noteId = `noteText${i}_${j}`;
                const isChecked = report.data[checkboxId] ? "✅" : "❌";
                const notes = report.data[noteId] && report.data[noteId] !== "لا توجد ملاحظات بعد" ? `<br><small class="text-muted">${report.data[noteId].replace(/\n/g, '<br>')}</small>` : "";
                tableHTML += `<td>${isChecked}${notes}</td>`;
            }
            tableHTML += `</tr>`;
        }
        tableHTML += `</tbody>`;
        reportTable.innerHTML = tableHTML;
        reportDiv.appendChild(reportTable);

        // Add delete button for individual report
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('btn', 'btn-sm', 'btn-danger', 'mt-2', 'no-print');
        deleteBtn.textContent = 'حذف هذا التقرير';
        deleteBtn.onclick = () => deleteReport(index);
        reportDiv.appendChild(deleteBtn);

        reportsList.appendChild(reportDiv);
    });
}

// Function to clear all saved reports from local storage
function clearAllReports() {
    if (confirm("هل أنت متأكد أنك تريد حذف جميع التقارير المحفوظة؟")) {
        localStorage.removeItem("weeklyReports");
        displayAllReports(); // Refresh the display
        updateReportSelect(); // Clear the select options
        alert("تم حذف جميع التقارير.");
    }
}

// Function to delete a specific report by its index
function deleteReport(indexToDelete) {
    const savedReports = JSON.parse(localStorage.getItem("weeklyReports")) || [];
    if (indexToDelete >= 0 && indexToDelete < savedReports.length) {
        savedReports.splice(indexToDelete, 1);
        localStorage.setItem("weeklyReports", JSON.stringify(savedReports));
        displayAllReports(); // Refresh the display
        updateReportSelect(); // Refresh the select options
        alert("تم حذف التقرير بنجاح.");
    }
}

// Function to populate the report select dropdown
function updateReportSelect() {
    const reportSelect = document.getElementById("reportSelect");
    reportSelect.innerHTML = '<option value="">اختر تقرير أسبوع...</option>';
    const savedReports = JSON.parse(localStorage.getItem("weeklyReports")) || [];
    savedReports.forEach((report, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `تقرير بتاريخ: ${report.date}`;
        reportSelect.appendChild(option);
    });
}

// Function to display a selected saved report
function displaySavedReport() {
    const reportSelect = document.getElementById("reportSelect");
    const selectedIndex = reportSelect.value;
    const reportsList = document.getElementById("reportsList");
    reportsList.innerHTML = ""; // Clear existing reports

    if (selectedIndex === "") {
        return; // No report selected
    }

    const savedReports = JSON.parse(localStorage.getItem("weeklyReports")) || [];
    const selectedReport = savedReports[selectedIndex];

    if (selectedReport) {
        const reportDiv = document.createElement("div");
        reportDiv.classList.add("card", "mb-4", "p-3");
        reportDiv.innerHTML = `<h5 class="card-title text-primary">تقرير الأسبوع بتاريخ: ${selectedReport.date}</h5>`;

        const reportTable = document.createElement("table");
        reportTable.classList.add("table", "table-bordered", "table-sm");
        let tableHTML = `
          <thead>
            <tr>
              <th>اليوم</th>
              <th>التاريخ</th>
              ${topics.map(topic => `<th>${topic}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
        `;

        const weekDates = getWeekDates();

        for (let i = 0; i < weekData.length; i++) {
            tableHTML += `<tr><td>${weekData[i].day}</td><td>${weekDates[i]}</td>`;
            for (let j = 0; j < topics.length; j++) {
                const checkboxId = `check${i}_${j}`;
                const noteId = `noteText${i}_${j}`;
                const isChecked = selectedReport.data[checkboxId] ? "✅" : "❌";
                const notes = selectedReport.data[noteId] && selectedReport.data[noteId] !== "لا توجد ملاحظات بعد" ? `<br><small class="text-muted">${selectedReport.data[noteId].replace(/\n/g, '<br>')}</small>` : "";
                tableHTML += `<td>${isChecked}${notes}</td>`;
            }
            tableHTML += `</tr>`;
        }
        tableHTML += `</tbody>`;
        reportTable.innerHTML = tableHTML;
        reportDiv.appendChild(reportTable);
        reportsList.appendChild(reportDiv);

        document.getElementById("resultsContainer").style.display = "block";
    }
}


function printReport() {
    const reportContent = document.getElementById('reportsList').innerHTML; // استخدم reportsList بدل report-section
    const printWindow = window.open();

    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>تقرير الأسبوع</title>
            <link rel="stylesheet" href="style.css">
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
                .text-muted { color: #6c757d; font-size: 0.85rem; }
                .no-print { display: none !important; } /* إخفاء أزرار الحذف */
            </style>
        </head>
        <body>
            ${reportContent}
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('✅ Service Worker مسجل'))
        .catch(error => console.error('❌ فشل التسجيل:', error));
}

let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'inline-block';
});

installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choice => {
            if (choice.outcome === 'accepted') {
                console.log("✅ تم التثبيت");
            }
            deferredPrompt = null;
            installBtn.style.display = 'none';
        });
    }
});


// Function to show the selected report (called by button click)
function showSelectedReport() {
    displaySavedReport();
}


// Initial load
document.addEventListener("DOMContentLoaded", () => {
    loadTable(); // Load the current week's data or an empty table
    updateReportSelect(); // Populate the report select dropdown
});
