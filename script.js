const studentForm = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const searchInput = document.getElementById("searchInput");
const attendanceDate = document.getElementById("attendanceDate");
const subjectSelect = document.getElementById("subjectSelect");
const attendanceTable = document.getElementById("attendanceTable");

const totalStudentsEl = document.getElementById("totalStudents");
const presentTodayEl = document.getElementById("presentToday");
const absentTodayEl = document.getElementById("absentToday");

const STORAGE_KEY = "attendanceTrackerStudents";
const ATTENDANCE_KEY = "attendanceTrackerRecords";

let students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let attendanceData = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || {};

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function saveAttendance() {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendanceData));
}

function getDateKey() {
  const date = attendanceDate.value || new Date().toISOString().split("T")[0];
  return date;
}

function getSubjectKey() {
  return subjectSelect.value;
}

function showStats() {
  totalStudentsEl.textContent = students.length;

  const dateKey = getDateKey();
  const subjectKey = getSubjectKey();

  const recordsForDate = attendanceData[dateKey] || {};
  const recordsForSubject = recordsForDate[subjectKey] || {};

  let present = 0;
  let absent = 0;

  students.forEach((student) => {
    const status = recordsForSubject[student.rollNo];

    if (status === "present") present++;
    if (status === "absent") absent++;
  });

  presentTodayEl.textContent = present;
  absentTodayEl.textContent = absent;
}

function renderStudents() {
  const query = searchInput.value.toLowerCase().trim();

  const filtered = students.filter((student) => {
    return (
      student.name.toLowerCase().includes(query) ||
      student.rollNo.toLowerCase().includes(query) ||
      student.className.toLowerCase().includes(query)
    );
  });

  studentList.innerHTML = "";

  if (filtered.length === 0) {
    studentList.innerHTML = "<div class='empty-state'>No students found.</div>";
    return;
  }

  filtered.forEach((student) => {
    const card = document.createElement("div");
    card.className = "student-card";

    card.innerHTML = `
      <h3>${student.name}</h3>
      <p>Roll: ${student.rollNo}</p>
      <p>Class: ${student.className}</p>
      <button class="small-btn" data-id="${student.id}">Delete</button>
    `;

    studentList.appendChild(card);
  });
}

function renderAttendanceTable() {
  if (students.length === 0) {
    attendanceTable.innerHTML = "<div class='empty-state'>No students added yet.</div>";
    showStats();
    return;
  }

  const dateKey = getDateKey();
  const subjectKey = getSubjectKey();

  const recordsForDate = attendanceData[dateKey] || {};
  const recordsForSubject = recordsForDate[subjectKey] || {};

  let tableHtml = `
    <table>
      <thead>
        <tr>
          <th>Student</th>
          <th>Roll No</th>
          <th>Class</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  students.forEach((student) => {
    const currentStatus = recordsForSubject[student.rollNo] || "absent";
    const presentClass = currentStatus === "present" ? "present" : "";
    const absentClass = currentStatus === "absent" ? "absent" : "";

    tableHtml += `
      <tr>
        <td>${student.name}</td>
        <td>${student.rollNo}</td>
        <td>${student.className}</td>
        <td>
          <button class="status-btn present ${presentClass}" data-status="present" data-roll="${student.rollNo}">
            Present
          </button>
          <button class="status-btn absent ${absentClass}" data-status="absent" data-roll="${student.rollNo}">
            Absent
          </button>
        </td>
      </tr>
    `;
  });

  tableHtml += "</tbody></table>";

  attendanceTable.innerHTML = tableHtml;
  showStats();
}

function updateAttendance(rollNo, status) {
  const dateKey = getDateKey();
  const subjectKey = getSubjectKey();

  if (!attendanceData[dateKey]) attendanceData[dateKey] = {};
  if (!attendanceData[dateKey][subjectKey]) attendanceData[dateKey][subjectKey] = {};

  attendanceData[dateKey][subjectKey][rollNo] = status;
  saveAttendance();
  renderAttendanceTable();
}

studentForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("studentName").value.trim();
  const rollNo = document.getElementById("studentRoll").value.trim();
  const className = document.getElementById("studentClass").value.trim();

  if (!name || !rollNo || !className) return;

  const exists = students.some((student) => student.rollNo === rollNo);

  if (exists) {
    alert("A student with this roll number already exists.");
    return;
  }

  students.push({
    id: Date.now(),
    name,
    rollNo,
    className
  });

  saveStudents();
  renderStudents();
  renderAttendanceTable();
  studentForm.reset();
});

searchInput.addEventListener("input", renderStudents);

subjectSelect.addEventListener("change", renderAttendanceTable);
attendanceDate.addEventListener("change", renderAttendanceTable);

studentList.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".small-btn");
  if (!deleteBtn) return;

  const id = Number(deleteBtn.dataset.id);
  students = students.filter((student) => student.id !== id);
  saveStudents();
  renderStudents();
  renderAttendanceTable();
});

attendanceTable.addEventListener("click", (e) => {
  const btn = e.target.closest(".status-btn");
  if (!btn) return;

  const rollNo = btn.dataset.roll;
  const status = btn.dataset.status;

  updateAttendance(rollNo, status);
});

attendanceDate.value = new Date().toISOString().split("T")[0];

renderStudents();
renderAttendanceTable();