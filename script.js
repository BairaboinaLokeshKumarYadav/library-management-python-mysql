const STORAGE_KEY = "librarySphereState";

const initialState = {
  books: [
    { id: 1, title: "Atomic Habits", author: "James Clear", isbn: "9780735211292", genre: "Self Help", publisher: "Avery", location: "A-01", minStock: 1, quantity: 4, available: 3 },
    { id: 2, title: "The Pragmatic Programmer", author: "Andrew Hunt", isbn: "9780201616224", genre: "Technology", publisher: "Addison-Wesley", location: "T-02", minStock: 1, quantity: 3, available: 2 },
    { id: 3, title: "Pride and Prejudice", author: "Jane Austen", isbn: "9781503290563", genre: "Classic", publisher: "T. Egerton", location: "C-01", minStock: 1, quantity: 5, available: 5 },
    { id: 4, title: "Deep Work", author: "Cal Newport", isbn: "9781455586691", genre: "Productivity", publisher: "Grand Central", location: "P-03", minStock: 1, quantity: 2, available: 1 }
  ],
  members: [
    { id: 1, name: "Aisha Khan", address: "Bengaluru", contact: "9876543210", email: "aisha@example.com", expiresAt: "", role: "member" },
    { id: 2, name: "Rohit Sharma", address: "Hyderabad", contact: "9988776655", email: "rohit@example.com", expiresAt: "", role: "admin" },
    { id: 3, name: "Meera Nair", address: "Chennai", contact: "9123456780", email: "meera@example.com", expiresAt: "", role: "member" }
  ],
  loans: [
    {
      id: 1,
      bookId: 1,
      memberId: 1,
      issueDate: "2026-09-01",
      returnDate: null,
      dueDate: "2026-09-15"
    }
  ],
  activity: [
    "System ready for new library operations.",
    "Sample books and members are loaded for demo use."
  ],
  reservations: [],
  settings: { loanDays: 14, finePerDay: 1, currency: "$" }
};

const state = loadState();

const elements = {
  totalBooks: document.getElementById("totalBooks"),
  availableBooks: document.getElementById("availableBooks"),
  borrowedBooks: document.getElementById("borrowedBooks"),
  memberCount: document.getElementById("memberCount"),
  topGenre: document.getElementById("topGenre"),
  lowStockCount: document.getElementById("lowStockCount"),
  insightList: document.getElementById("insightList"),
  activityList: document.getElementById("activityList"),
  bookTableBody: document.getElementById("bookTableBody"),
  memberTableBody: document.getElementById("memberTableBody"),
  genreFilter: document.getElementById("genreFilter"),
  availabilityFilter: document.getElementById("availabilityFilter"),
  bookSearch: document.getElementById("bookSearch"),
  memberSearch: document.getElementById("memberSearch"),
  memberStatusFilter: document.getElementById("memberStatusFilter"),
  loanSearch: document.getElementById("loanSearch"),
  loanStatusFilter: document.getElementById("loanStatusFilter"),
  historySearch: document.getElementById("historySearch"),
  historyFilter: document.getElementById("historyFilter"),
  bookForm: document.getElementById("bookForm"),
  memberForm: document.getElementById("memberForm"),
  borrowForm: document.getElementById("borrowForm"),
  reservationForm: document.getElementById("reservationForm"),
  memberSelect: document.getElementById("memberSelect"),
  borrowBookSelect: document.getElementById("borrowBookSelect"),
  reservationMemberSelect: document.getElementById("reservationMemberSelect"),
  reservationBookSelect: document.getElementById("reservationBookSelect"),
  loanPeriodSelect: document.getElementById("loanPeriodSelect"),
  issueList: document.getElementById("issueList"),
  reservationList: document.getElementById("reservationList"),
  reservationCount: document.getElementById("reservationCount"),
  historyTableBody: document.getElementById("historyTableBody"),
  settingsForm: document.getElementById("settingsForm"),
  importBtn: document.getElementById("importBtn"),
  importFile: document.getElementById("importFile"),
  resetAllBtn: document.getElementById("resetAllBtn"),
  exportBtn: document.getElementById("exportBtn"),
  settingsExportBtn: document.getElementById("settingsExportBtn"),
  settingsImportBtn: document.getElementById("settingsImportBtn"),
  exportReportBtn: document.getElementById("exportReportBtn"),
  dateLabel: document.getElementById("dateLabel"),
  storageUsage: document.getElementById("storageUsage")
};

const allSections = [...document.querySelectorAll(".section-panel")];
const navButtons = [...document.querySelectorAll(".nav-btn")];
const quickButtons = [...document.querySelectorAll(".ghost-btn[data-section]")];

initialize();

function initialize() {
  bindNavigation();
  bindBookForm();
  bindMemberForm();
  bindBorrowForm();
  bindReservationForm();
  bindSettings();
  bindReset();
  bindExport();
  bindImport();
  bindReports();
  elements.dateLabel.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).toUpperCase();
  populateGenreOptions();
  render();
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(initialState);
    return {
      books: Array.isArray(saved.books) ? saved.books : initialState.books,
      members: Array.isArray(saved.members) ? saved.members : initialState.members,
      loans: Array.isArray(saved.loans) ? saved.loans : initialState.loans,
      activity: Array.isArray(saved.activity) ? saved.activity : initialState.activity,
      reservations: Array.isArray(saved.reservations) ? saved.reservations : [],
      settings: { ...initialState.settings, ...(saved.settings || {}) }
    };
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function recordActivity(message) {
  const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  state.activity = [`${stamp} • ${message}`, ...state.activity].slice(0, 8);
  saveState();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function bindNavigation() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      switchSection(button.dataset.section);
    });
  });

  quickButtons.forEach((button) => {
    button.addEventListener("click", () => {
      switchSection(button.dataset.section);
    });
  });
}

function switchSection(targetId) {
  allSections.forEach((section) => {
    section.classList.toggle("hidden", section.id !== targetId);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.section === targetId);
  });
}

function bindBookForm() {
  elements.bookForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") || "").trim();
    const author = String(formData.get("author") || "").trim();
    const isbn = String(formData.get("isbn") || "").trim();
    const genre = String(formData.get("genre") || "").trim();
    const publisher = String(formData.get("publisher") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const minStock = Number(formData.get("minStock") || 0);
    const quantity = Number(formData.get("quantity") || 0);

    if (!title || !author || !isbn || !genre || quantity <= 0) {
      return;
    }

    const duplicate = state.books.some((book) => book.isbn.toLowerCase() === isbn.toLowerCase());
    if (duplicate) {
      alert("A book with this ISBN already exists in the catalog.");
      return;
    }

    state.books.push({
      id: generateId(state.books),
      title,
      author,
      isbn,
      genre,
      publisher,
      location,
      minStock,
      quantity,
      available: quantity
    });

    recordActivity(`Added "${title}" to the catalog.`);
    saveState();
    event.currentTarget.reset();
    render();
  });
}

function bindMemberForm() {
  elements.memberForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const contact = String(formData.get("contact") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const expiresAt = String(formData.get("expiresAt") || "");
    const role = String(formData.get("role") || "member");

    if (!name || !address || !contact) return;
    if (state.members.some((member) => member.contact === contact || (email && member.email?.toLowerCase() === email.toLowerCase()))) {
      alert("A member with this contact number or email is already registered.");
      return;
    }

    state.members.push({
      id: generateId(state.members),
      name,
      address,
      contact,
      email,
      expiresAt,
      role
    });

    recordActivity(`Registered new member: ${name}.`);
    saveState();
    event.currentTarget.reset();
    render();
  });
}

function bindBorrowForm() {
  elements.borrowForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const memberId = Number(elements.memberSelect.value);
    const bookId = Number(elements.borrowBookSelect.value);

    if (!memberId || !bookId) return;

    const book = state.books.find((item) => item.id === bookId);
    const member = state.members.find((item) => item.id === memberId);
    if (!member || (member.expiresAt && member.expiresAt < localDateString())) {
      alert("This member's membership has expired. Update their membership before checking out a book.");
      return;
    }
    const memberLoans = state.loans.filter((loan) => loan.memberId === memberId && !loan.returnDate);
    if (memberLoans.length >= 5) {
      alert("A member may have up to five active loans at a time.");
      return;
    }
    if (!book || book.available <= 0) {
      alert("This book is currently unavailable.");
      return;
    }

    const activeLoan = state.loans.some(
      (loan) => loan.bookId === bookId && loan.memberId === memberId && loan.returnDate === null
    );

    if (activeLoan) {
      alert("This member already has an active loan for this book.");
      return;
    }
    const nextHold = state.reservations
      .filter((hold) => hold.bookId === bookId)
      .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")))[0];
    if (nextHold && nextHold.memberId !== memberId) {
      const waitingMember = state.members.find((item) => item.id === nextHold.memberId);
      alert(`This title is reserved for ${waitingMember?.name || "another member"}. Please serve the reservation queue first.`);
      return;
    }

    const today = localDateString();
    const loanDays = Number(elements.loanPeriodSelect.value) || Number(state.settings.loanDays);
    const dueDate = addDays(today, loanDays);

    state.books = state.books.map((item) =>
      item.id === bookId ? { ...item, available: item.available - 1 } : item
    );

    state.loans.push({
      id: generateId(state.loans),
      bookId,
      memberId,
      issueDate: today,
      returnDate: null,
      dueDate,
      renewals: 0,
      fine: 0
    });
    state.reservations = state.reservations.filter((hold) => !(hold.bookId === bookId && hold.memberId === memberId));

    const memberName = state.members.find((m) => m.id === memberId)?.name || "Member";
    recordActivity(`${memberName} borrowed "${book.title}".`);
    saveState();
    render();
  });
}

function bindReset() {
  elements.resetAllBtn.addEventListener("click", () => {
    if (!window.confirm("Restore the original sample books and members? Your current browser data will be replaced.")) {
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    Object.assign(state, structuredClone(initialState));
    recordActivity("Demo data was reset.");
    render();
  });
}

function bindExport() {
  [elements.exportBtn, elements.settingsExportBtn].forEach((button) => {
    button.addEventListener("click", exportBackup);
  });
}

function exportBackup() {
  downloadFile(
    JSON.stringify({ format: "folio-library-backup", version: 1, exportedAt: new Date().toISOString(), data: state }, null, 2),
    `folio-library-${new Date().toISOString().slice(0, 10)}.json`,
    "application/json"
  );
}

function downloadFile(content, filename, type) {
  const file = new Blob([content], { type });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function bindImport() {
  elements.importBtn.addEventListener("click", () => elements.importFile.click());
  elements.settingsImportBtn.addEventListener("click", () => elements.importFile.click());
  elements.importFile.addEventListener("change", async () => {
    const file = elements.importFile.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const imported = parsed.data || parsed;
      if (!Array.isArray(imported.books) || !Array.isArray(imported.members) || !Array.isArray(imported.loans)) {
        throw new Error("The selected file is not a valid Folio library backup.");
      }
      if (!window.confirm("Replace the current library data with this backup?")) return;
      Object.assign(state, {
        books: imported.books,
        members: imported.members,
        loans: imported.loans,
        reservations: Array.isArray(imported.reservations) ? imported.reservations : [],
        activity: Array.isArray(imported.activity) ? imported.activity : [],
        settings: { ...initialState.settings, ...(imported.settings || {}) }
      });
      recordActivity("Library data restored from backup.");
      render();
      alert("Backup restored successfully.");
    } catch (error) {
      alert(error.message || "Could not read this backup file.");
    } finally {
      elements.importFile.value = "";
    }
  });
}

function populateGenreOptions() {
  const selectedGenre = elements.genreFilter.value || "all";
  const genres = ["all", ...new Set(state.books.map((book) => book.genre).filter(Boolean))];
  elements.genreFilter.innerHTML = genres
    .map((genre) => `<option value="${escapeHtml(genre)}">${genre === "all" ? "All genres" : escapeHtml(genre)}</option>`)
    .join("");
  elements.genreFilter.value = genres.includes(selectedGenre) ? selectedGenre : "all";
}

function render() {
  renderStats();
  renderBookTable();
  renderMembers();
  renderLoanControls();
  renderIssueList();
  renderHistory();
  renderReservations();
  renderReports();
  renderActivity();
  renderSettings();
  populateGenreOptions();
}

function renderStats() {
  const totalBooks = state.books.length;
  const availableBooks = state.books.reduce((sum, book) => sum + book.available, 0);
  const borrowedBooks = state.books.reduce((sum, book) => sum + (book.quantity - book.available), 0);
  const memberCount = state.members.length;

  elements.totalBooks.textContent = totalBooks;
  elements.availableBooks.textContent = availableBooks;
  elements.borrowedBooks.textContent = borrowedBooks;
  elements.memberCount.textContent = memberCount;

  const genreCounts = {};
  state.books.forEach((book) => {
    genreCounts[book.genre] = (genreCounts[book.genre] || 0) + book.quantity;
  });
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0];
  elements.topGenre.textContent = topGenre ? topGenre[0] : "-";

  const lowStockCount = state.books.filter((book) => book.available <= 1).length;
  elements.lowStockCount.textContent = lowStockCount;

  const overdueCount = state.loans.filter((loan) => !loan.returnDate && isPastDue(loan.dueDate)).length;
  const insights = [
    `${totalBooks} books cataloged across ${Object.keys(genreCounts).length} genres`,
    `${availableBooks} copies currently available for borrowing`,
    `${overdueCount} active loans are past their due date`
  ];
  elements.insightList.innerHTML = insights.map((item) => `<li>${item}</li>`).join("");
}

function renderActivity() {
  const feed = state.activity.length ? state.activity : ["System ready for your next library action."];
  elements.activityList.innerHTML = feed.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderBookTable() {
  const searchTerm = elements.bookSearch.value.trim().toLowerCase();
  const selectedGenre = elements.genreFilter.value;
  const availability = elements.availabilityFilter.value;

  const filteredBooks = state.books.filter((book) => {
    const matchesSearch =
      !searchTerm ||
      [book.title, book.author, book.isbn, book.publisher, book.location]
        .some((value) => String(value || "").toLowerCase().includes(searchTerm));
    const matchesGenre = selectedGenre === "all" || book.genre === selectedGenre;
    const matchesAvailability = availability === "all"
      || (availability === "available" && book.available > 0)
      || (availability === "unavailable" && book.available === 0);
    return matchesSearch && matchesGenre && matchesAvailability;
  });

  if (!filteredBooks.length) {
    elements.bookTableBody.innerHTML = `<tr><td colspan="9" class="empty-state">No books match the current filters.</td></tr>`;
    return;
  }

  elements.bookTableBody.innerHTML = filteredBooks
    .map(
      (book) => `
        <tr>
          <td>${book.id}</td>
          <td><strong>${escapeHtml(book.title)}</strong><small class="table-subtitle">${escapeHtml(book.publisher || "")}</small></td>
          <td>${escapeHtml(book.author)}</td>
          <td>${escapeHtml(book.isbn)}</td>
          <td>${escapeHtml(book.genre)}</td>
          <td>${escapeHtml(book.location || "—")}</td>
          <td>${book.quantity}</td>
          <td>
            <span class="badge ${book.available > 0 ? "available" : "unavailable"}">${book.available}</span>
          </td>
          <td>
            <div class="row-actions">
              <button class="action-btn" data-action="borrow" data-book-id="${book.id}" ${book.available <= 0 ? "disabled" : ""}>Borrow</button>
              <button class="action-btn" data-action="edit-book" data-book-id="${book.id}">Edit</button>
              <button class="action-btn delete-action" data-action="delete-book" data-book-id="${book.id}">Delete</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  document.querySelectorAll("[data-action='borrow']").forEach((button) => {
    button.addEventListener("click", () => {
      const bookId = Number(button.dataset.bookId);
      const book = state.books.find((item) => item.id === bookId);
      if (!book) return;
      if (book.available <= 0) return;

      if (!state.members.length) {
        alert("Please register a member before borrowing a book.");
        return;
      }
      switchSection("issues");
      elements.borrowBookSelect.value = String(bookId);
      elements.memberSelect.focus();
      elements.memberSelect.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  document.querySelectorAll("[data-action='edit-book']").forEach((button) => {
    button.addEventListener("click", () => editBook(Number(button.dataset.bookId)));
  });
  document.querySelectorAll("[data-action='delete-book']").forEach((button) => {
    button.addEventListener("click", () => deleteBook(Number(button.dataset.bookId)));
  });
}

function editBook(bookId) {
  const book = state.books.find((item) => item.id === bookId);
  if (!book) return;
  const title = window.prompt("Book title:", book.title);
  if (title === null) return;
  const author = window.prompt("Author:", book.author);
  if (author === null) return;
  const genre = window.prompt("Genre:", book.genre);
  if (genre === null) return;
  const isbn = window.prompt("ISBN:", book.isbn);
  if (isbn === null) return;
  const location = window.prompt("Shelf / location:", book.location || "");
  if (location === null) return;
  const publisher = window.prompt("Publisher:", book.publisher || "");
  if (publisher === null) return;
  const minimum = window.prompt("Minimum stock alert:", String(book.minStock ?? 1));
  if (minimum === null) return;
  const quantityInput = window.prompt("Total copies:", String(book.quantity));
  if (quantityInput === null) return;
  const quantity = Number(quantityInput);
  const minStock = Number(minimum);
  const borrowed = book.quantity - book.available;
  const duplicateIsbn = state.books.some((item) => item.id !== bookId && item.isbn.toLowerCase() === isbn.trim().toLowerCase());
  if (!title.trim() || !author.trim() || !genre.trim() || !isbn.trim() || !Number.isInteger(quantity) || !Number.isInteger(minStock) || minStock < 0 || quantity < borrowed || duplicateIsbn) {
    alert("Enter valid book details. Total copies cannot be fewer than copies currently on loan.");
    return;
  }
  Object.assign(book, {
    title: title.trim(), author: author.trim(), genre: genre.trim(), isbn: isbn.trim(),
    location: location.trim(), publisher: publisher.trim(), minStock, quantity, available: quantity - borrowed
  });
  recordActivity(`Updated "${book.title}" in the catalog.`);
  render();
}

function deleteBook(bookId) {
  const book = state.books.find((item) => item.id === bookId);
  if (!book) return;
  if (state.loans.some((loan) => loan.bookId === bookId)) {
    alert("This book has circulation history. Keep the catalog record so past loans remain meaningful.");
    return;
  }
  if (!window.confirm(`Delete "${book.title}" from the catalog?`)) return;
  state.books = state.books.filter((item) => item.id !== bookId);
  state.reservations = state.reservations.filter((hold) => hold.bookId !== bookId);
  recordActivity(`Removed "${book.title}" from the catalog.`);
  render();
}

function renderMembers() {
  const term = elements.memberSearch.value.trim().toLowerCase();
  const status = elements.memberStatusFilter.value;
  const visibleMembers = state.members.filter((member) => {
    const matchesTerm = !term || [member.name, member.email, member.contact, member.address]
      .some((value) => String(value || "").toLowerCase().includes(term));
    const expired = member.expiresAt && member.expiresAt < localDateString();
    return matchesTerm && (status === "all" || (status === "expired" ? expired : !expired));
  });
  elements.memberTableBody.innerHTML = visibleMembers.length
    ? visibleMembers
        .map(
          (member) => `
            <tr>
              <td>${member.id}</td>
              <td><strong>${escapeHtml(member.name)}</strong><small class="table-subtitle">${escapeHtml(member.address || "")}${member.expiresAt ? ` · until ${escapeHtml(member.expiresAt)}` : ""}</small></td>
              <td>${escapeHtml(member.contact)}</td>
              <td>${escapeHtml(member.email || "—")}</td>
              <td>${state.loans.filter((loan) => loan.memberId === member.id && !loan.returnDate).length}</td>
              <td><span class="badge ${member.role === "admin" ? "role-admin" : "role-member"}">${escapeHtml(member.role)}</span></td>
              <td><div class="row-actions"><button class="action-btn" data-edit-member="${member.id}">Edit</button><button class="action-btn delete-action" data-delete-member="${member.id}">Remove</button></div></td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="7" class="empty-state">No matching members.</td></tr>`;

  document.querySelectorAll("[data-edit-member]").forEach((button) => {
    button.addEventListener("click", () => editMember(Number(button.dataset.editMember)));
  });
  document.querySelectorAll("[data-delete-member]").forEach((button) => {
    button.addEventListener("click", () => deleteMember(Number(button.dataset.deleteMember)));
  });
}

function editMember(memberId) {
  const member = state.members.find((item) => item.id === memberId);
  if (!member) return;
  const name = window.prompt("Member name:", member.name);
  if (name === null) return;
  const contact = window.prompt("Contact:", member.contact);
  if (contact === null) return;
  const email = window.prompt("Email:", member.email || "");
  if (email === null) return;
  const address = window.prompt("Address:", member.address || "");
  if (address === null) return;
  const role = window.prompt("Role (member/admin):", member.role);
  if (role === null) return;
  const expiresAt = window.prompt("Membership expiry (YYYY-MM-DD, blank for none):", member.expiresAt || "");
  if (expiresAt === null) return;
  if (!name.trim() || !contact.trim() || !["member", "admin"].includes(role.trim().toLowerCase())) {
    alert("Enter a name, contact, and a valid role (member or admin).");
    return;
  }
  Object.assign(member, { name: name.trim(), contact: contact.trim(), email: email.trim(), address: address.trim(), role: role.trim() || "member", expiresAt: expiresAt.trim() });
  recordActivity(`Updated member ${member.name}.`);
  render();
}

function deleteMember(memberId) {
  const member = state.members.find((item) => item.id === memberId);
  if (!member) return;
  if (state.loans.some((loan) => loan.memberId === memberId)) {
    alert("This member has borrowing history. Keep the record to preserve the library's transaction history.");
    return;
  }
  if (!window.confirm(`Remove ${member.name} from the member list?`)) return;
  state.members = state.members.filter((item) => item.id !== memberId);
  state.reservations = state.reservations.filter((hold) => hold.memberId !== memberId);
  recordActivity(`Removed member ${member.name}.`);
  render();
}

function renderLoanControls() {
  const memberOptions = state.members.length
    ? state.members.map((member) => `<option value="${member.id}">${escapeHtml(member.name)} (${escapeHtml(member.role)})</option>`).join("")
    : '<option value="">No members available</option>';
  elements.memberSelect.innerHTML = memberOptions;
  elements.reservationMemberSelect.innerHTML = memberOptions;

  const availableBooks = state.books.filter((book) => book.available > 0);
  if (!availableBooks.length) {
    elements.borrowBookSelect.innerHTML = '<option value="">No books available</option>';
  } else {
    elements.borrowBookSelect.innerHTML = availableBooks
      .map((book) => `<option value="${book.id}">${escapeHtml(book.title)} — ${book.available} available</option>`)
      .join("");
  }
  elements.reservationBookSelect.innerHTML = state.books.length
    ? state.books.map((book) => `<option value="${book.id}">${escapeHtml(book.title)} (${book.available} available)</option>`).join("")
    : '<option value="">No books in the catalog</option>';
}

function renderIssueList() {
  const term = elements.loanSearch.value.trim().toLowerCase();
  const filter = elements.loanStatusFilter.value;
  const activeLoans = state.loans.filter((loan) => {
    if (loan.returnDate) return false;
    const book = state.books.find((item) => item.id === loan.bookId);
    const member = state.members.find((item) => item.id === loan.memberId);
    const matchesTerm = !term || `${book?.title || ""} ${member?.name || ""}`.toLowerCase().includes(term);
    const dueSoon = !isPastDue(loan.dueDate) && daysUntil(loan.dueDate) <= 3;
    const matchesFilter = filter === "all"
      || (filter === "overdue" && isPastDue(loan.dueDate))
      || (filter === "due-soon" && dueSoon)
      || (filter === "on-time" && !dueSoon && !isPastDue(loan.dueDate));
    return matchesTerm && matchesFilter;
  });
  if (!activeLoans.length) {
    elements.issueList.innerHTML = '<li class="empty-state">No active loans match this filter.</li>';
    return;
  }

  elements.issueList.innerHTML = activeLoans
    .map((loan) => {
      const member = state.members.find((person) => person.id === loan.memberId);
      const book = state.books.find((item) => item.id === loan.bookId);
      const overdue = isPastDue(loan.dueDate);
      const dueSoon = !overdue && daysUntil(loan.dueDate) <= 3;
      const status = overdue ? "Overdue" : dueSoon ? "Due soon" : "On time";
      const currentFine = overdue ? Math.max(0, daysBetween(loan.dueDate, localDateString())) * Number(state.settings.finePerDay) : 0;
      return `
        <li>
          <div class="issue-meta">
            <strong>${escapeHtml(book ? book.title : "Unknown Book")}</strong>
            <span>${escapeHtml(member ? member.name : "Unknown Member")} · due ${escapeHtml(loan.dueDate)} · ${status}${currentFine ? ` · fine ${formatMoney(currentFine)}` : ""}</span>
          </div>
          <div class="row-actions">
            <button class="action-btn" data-renew-id="${loan.id}" ${Number(loan.renewals || 0) >= 2 ? "disabled" : ""}>Renew</button>
            <button class="action-btn return-btn" data-return-id="${loan.id}">Return</button>
          </div>
        </li>
      `;
    })
    .join("");

  document.querySelectorAll("[data-return-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const loanId = Number(button.dataset.returnId);
      const loan = state.loans.find((item) => item.id === loanId);
      if (!loan) return;

      loan.returnDate = localDateString();
      loan.fine = isPastDue(loan.dueDate)
        ? Math.max(0, daysBetween(loan.dueDate, loan.returnDate)) * Number(state.settings.finePerDay)
        : 0;
      loan.finePaid = loan.fine === 0;
      const book = state.books.find((item) => item.id === loan.bookId);
      if (book) {
        book.available = Math.min(book.quantity, book.available + 1);
      }
      const memberName = state.members.find((person) => person.id === loan.memberId)?.name || "Member";
      recordActivity(`${memberName} returned "${book ? book.title : "the book"}"${loan.fine ? ` · fine ${formatMoney(loan.fine)}` : ""}.`);
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-renew-id]").forEach((button) => {
    button.addEventListener("click", () => renewLoan(Number(button.dataset.renewId)));
  });
}

function renewLoan(loanId) {
  const loan = state.loans.find((item) => item.id === loanId && !item.returnDate);
  if (!loan || Number(loan.renewals || 0) >= 2) return;
  if (isPastDue(loan.dueDate)) {
    alert("Overdue loans must be returned before they can be renewed.");
    return;
  }
  const activeHolds = state.reservations.some((hold) => hold.bookId === loan.bookId);
  if (activeHolds) {
    alert("This title has a waiting reservation and cannot be renewed.");
    return;
  }
  loan.dueDate = addDays(loan.dueDate, Number(state.settings.loanDays));
  loan.renewals = Number(loan.renewals || 0) + 1;
  recordActivity(`Loan renewed; new due date ${loan.dueDate}.`);
  render();
}

function renderHistory() {
  const term = elements.historySearch.value.trim().toLowerCase();
  const filter = elements.historyFilter.value;
  const closed = state.loans.filter((loan) => loan.returnDate).filter((loan) => {
    const book = state.books.find((item) => item.id === loan.bookId);
    const member = state.members.find((item) => item.id === loan.memberId);
    const matches = !term || `${book?.title || ""} ${member?.name || ""}`.toLowerCase().includes(term);
    return matches && (filter === "all" || (filter === "with-fines" && Number(loan.fine) > 0) || (filter === "no-fines" && !Number(loan.fine)));
  }).sort((a, b) => String(b.returnDate).localeCompare(String(a.returnDate)));
  elements.historyTableBody.innerHTML = closed.length ? closed.map((loan) => {
    const book = state.books.find((item) => item.id === loan.bookId);
    const member = state.members.find((item) => item.id === loan.memberId);
    const hasFine = Number(loan.fine || 0) > 0;
    const payment = hasFine
      ? loan.finePaid
        ? '<span class="badge available">Paid</span>'
        : `<button class="action-btn return-btn" data-fine-paid="${loan.id}">Mark paid</button>`
      : '<span class="subtle-note">No fine</span>';
    return `<tr><td>${escapeHtml(member?.name || "Removed member")}</td><td>${escapeHtml(book?.title || "Removed book")}</td><td>${escapeHtml(loan.issueDate)}</td><td>${escapeHtml(loan.dueDate)}</td><td>${escapeHtml(loan.returnDate)}</td><td>${formatMoney(Number(loan.fine || 0))}</td><td>${payment}</td></tr>`;
  }).join("") : '<tr><td colspan="7" class="empty-state">No returned loans match this filter.</td></tr>';
  document.querySelectorAll("[data-fine-paid]").forEach((button) => {
    button.addEventListener("click", () => {
      const loan = state.loans.find((item) => item.id === Number(button.dataset.finePaid));
      if (!loan) return;
      loan.finePaid = true;
      recordActivity(`Fine payment recorded: ${formatMoney(loan.fine)}.`);
      render();
    });
  });
}

function bindReservationForm() {
  elements.reservationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const memberId = Number(elements.reservationMemberSelect.value);
    const bookId = Number(elements.reservationBookSelect.value);
    if (!memberId || !bookId) return;
    if (state.reservations.some((hold) => hold.bookId === bookId && hold.memberId === memberId)) {
      alert("This member is already in the reservation queue for this title.");
      return;
    }
    const hasActiveLoan = state.loans.some((loan) => loan.bookId === bookId && loan.memberId === memberId && !loan.returnDate);
    if (hasActiveLoan) {
      alert("This member already has an active loan for this title.");
      return;
    }
    const member = state.members.find((item) => item.id === memberId);
    if (!member || (member.expiresAt && member.expiresAt < localDateString())) {
      alert("Only members with an active membership can reserve books.");
      return;
    }
    state.reservations.push({ id: generateId(state.reservations), bookId, memberId, createdAt: new Date().toISOString() });
    const book = state.books.find((item) => item.id === bookId);
    recordActivity(`${member?.name || "A member"} joined the reservation queue for "${book?.title || "a book"}".`);
    render();
  });
}

function renderReservations() {
  const sorted = [...state.reservations].sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
  elements.reservationCount.textContent = sorted.length;
  elements.reservationList.innerHTML = sorted.length ? sorted.map((hold, index) => {
    const book = state.books.find((item) => item.id === hold.bookId);
    const member = state.members.find((item) => item.id === hold.memberId);
    const available = book && book.available > 0;
    return `<li>
      <div class="issue-meta">
        <strong><span class="queue-number">${index + 1}</span>${escapeHtml(book?.title || "Removed book")}</strong>
        <span>${escapeHtml(member?.name || "Removed member")} · ${available ? "Copy available" : "Waiting for a copy"} · placed ${hold.createdAt ? new Date(hold.createdAt).toLocaleDateString() : "date unavailable"}</span>
      </div>
      <div class="row-actions">
        ${available ? `<button class="action-btn return-btn" data-issue-hold="${hold.id}">Issue to member</button>` : ""}
        <button class="action-btn delete-action" data-cancel-hold="${hold.id}">Cancel</button>
      </div>
    </li>`;
  }).join("") : '<li class="empty-state">No reservations yet. Add a hold when a member wants a title.</li>';

  document.querySelectorAll("[data-cancel-hold]").forEach((button) => {
    button.addEventListener("click", () => {
      const hold = state.reservations.find((item) => item.id === Number(button.dataset.cancelHold));
      if (!hold) return;
      state.reservations = state.reservations.filter((item) => item.id !== hold.id);
      recordActivity("A book reservation was cancelled.");
      render();
    });
  });
  document.querySelectorAll("[data-issue-hold]").forEach((button) => {
    button.addEventListener("click", () => {
      const hold = state.reservations.find((item) => item.id === Number(button.dataset.issueHold));
      if (!hold) return;
      switchSection("issues");
      elements.memberSelect.value = String(hold.memberId);
      elements.borrowBookSelect.value = String(hold.bookId);
      elements.borrowForm.requestSubmit();
    });
  });
}

function renderReports() {
  const copies = state.books.reduce((total, book) => total + Number(book.quantity || 0), 0);
  const overdueLoans = state.loans.filter((loan) => !loan.returnDate && isPastDue(loan.dueDate));
  const activeFines = overdueLoans.reduce((total, loan) => total + daysBetween(loan.dueDate, localDateString()) * Number(state.settings.finePerDay), 0);
  const unpaidReturnedFines = state.loans
    .filter((loan) => loan.returnDate && Number(loan.fine || 0) > 0 && !loan.finePaid)
    .reduce((total, loan) => total + Number(loan.fine || 0), 0);
  const counts = new Map();
  state.loans.forEach((loan) => counts.set(loan.bookId, (counts.get(loan.bookId) || 0) + 1));
  const popular = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const popularTitle = popular ? state.books.find((book) => book.id === popular[0])?.title || "Removed title" : "—";
  document.getElementById("reportCopies").textContent = copies;
  document.getElementById("reportFines").textContent = formatMoney(activeFines + unpaidReturnedFines);
  document.getElementById("reportPopular").textContent = popularTitle;
  document.getElementById("reportOverdue").textContent = overdueLoans.length;

  const genreTotals = new Map();
  state.books.forEach((book) => genreTotals.set(book.genre || "Uncategorized", (genreTotals.get(book.genre || "Uncategorized") || 0) + Number(book.quantity || 0)));
  const maxGenre = Math.max(1, ...genreTotals.values());
  document.getElementById("genreReport").innerHTML = genreTotals.size
    ? [...genreTotals.entries()].sort((a, b) => b[1] - a[1]).map(([genre, total]) =>
      `<div class="bar-row"><span>${escapeHtml(genre)}</span><div class="bar-track"><i style="width:${Math.max(4, Math.round(total / maxGenre * 100))}%"></i></div><b>${total}</b></div>`
    ).join("")
    : '<p class="empty-state">Add books to see your collection breakdown.</p>';

  const restock = state.books.filter((book) => book.available <= Number(book.minStock ?? 1));
  document.getElementById("restockList").innerHTML = restock.length
    ? restock.map((book) => `<li>${escapeHtml(book.title)} · ${book.available} available (alert at ${Number(book.minStock ?? 1)})</li>`).join("")
    : "<li>Everything is comfortably in stock.</li>";
}

function bindReports() {
  elements.exportReportBtn.addEventListener("click", () => {
    const rows = [["Book", "Author", "ISBN", "Genre", "Shelf", "Total copies", "Available copies", "Borrowed copies"]];
    state.books.forEach((book) => rows.push([
      book.title, book.author, book.isbn, book.genre, book.location || "",
      book.quantity, book.available, book.quantity - book.available
    ]));
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    downloadFile(csv, `folio-inventory-${localDateString()}.csv`, "text/csv;charset=utf-8");
  });
}

function bindSettings() {
  const form = elements.settingsForm;
  form.elements.loanDays.value = state.settings.loanDays;
  form.elements.finePerDay.value = state.settings.finePerDay;
  form.elements.currency.value = state.settings.currency;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const loanDays = Number(form.elements.loanDays.value);
    const finePerDay = Number(form.elements.finePerDay.value);
    const currency = form.elements.currency.value.trim();
    if (!Number.isInteger(loanDays) || loanDays < 1 || loanDays > 90 || finePerDay < 0 || !currency) {
      alert("Enter a loan period from 1–90 days, a non-negative daily fee, and a currency symbol.");
      return;
    }
    state.settings = { loanDays, finePerDay, currency };
    recordActivity("Circulation policy updated.");
    render();
  });
}

function renderSettings() {
  const bytes = new Blob([JSON.stringify(state)]).size;
  elements.storageUsage.textContent = `This library uses approximately ${(bytes / 1024).toFixed(1)} KB of browser storage. Data is stored on this device only.`;
  elements.settingsForm.elements.loanDays.value = state.settings.loanDays;
  elements.settingsForm.elements.finePerDay.value = state.settings.finePerDay;
  elements.settingsForm.elements.currency.value = state.settings.currency;
}

function generateId(collection) {
  return collection.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

function daysBetween(start, end) {
  const [startYear, startMonth, startDay] = start.split("-").map(Number);
  const [endYear, endMonth, endDay] = end.split("-").map(Number);
  return Math.max(0, Math.floor((Date.UTC(endYear, endMonth - 1, endDay) - Date.UTC(startYear, startMonth - 1, startDay)) / 86400000));
}

function daysUntil(dateString) {
  return daysBetween(localDateString(), dateString) * (dateString >= localDateString() ? 1 : -1);
}

function formatMoney(amount) {
  return `${escapeHtml(state.settings.currency || "$")}${Number(amount || 0).toFixed(2)}`;
}

function isPastDue(dateString) {
  return Boolean(dateString && dateString < localDateString());
}

["input", "change"].forEach((eventName) => {
  elements.bookSearch.addEventListener(eventName, renderBookTable);
  elements.genreFilter.addEventListener(eventName, renderBookTable);
  elements.availabilityFilter.addEventListener(eventName, renderBookTable);
  elements.memberSearch.addEventListener(eventName, renderMembers);
  elements.memberStatusFilter.addEventListener(eventName, renderMembers);
  elements.loanSearch.addEventListener(eventName, renderIssueList);
  elements.loanStatusFilter.addEventListener(eventName, renderIssueList);
  elements.historySearch.addEventListener(eventName, renderHistory);
  elements.historyFilter.addEventListener(eventName, renderHistory);
});
