// Admin Panel Script
const ADMIN_PASSWORD_KEY = "admin_password_hash";
const CERTIFICATIONS_KEY = "admin_certifications";
const BOOKINGS_KEY = "admin_bookings";

let currentEditingCertId = null;

// Simple password hash (not secure for production, use backend authentication)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

function checkAdminAuth() {
    const passwordHash = localStorage.getItem(ADMIN_PASSWORD_KEY);
    if (passwordHash) {
        const enteredPassword = prompt("Enter admin password:");
        if (enteredPassword === null) {
            window.location.href = "index.html";
            return;
        }
        if (hashPassword(enteredPassword) !== passwordHash) {
            alert("Incorrect password!");
            window.location.href = "index.html";
            return;
        }
    }
}

function saveAdminPassword() {
    const password = document.getElementById("adminPassword").value;
    if (!password) {
        alert("Please enter a password");
        return;
    }
    localStorage.setItem(ADMIN_PASSWORD_KEY, hashPassword(password));
    document.getElementById("settingsStatus").textContent = "✓ Password saved!";
    document.getElementById("adminPassword").value = "";
    setTimeout(() => {
        document.getElementById("settingsStatus").textContent = "";
    }, 3000);
}

function addCertificate() {
    const title = document.getElementById("certTitle").value.trim();
    const issuer = document.getElementById("certIssuer").value.trim();
    const date = document.getElementById("certDate").value;
    const link = document.getElementById("certLink").value.trim();
    const description = document.getElementById("certDescription").value.trim();

    if (!title || !issuer || !date) {
        alert("Please fill in all required fields");
        return;
    }

    let certs = JSON.parse(localStorage.getItem(CERTIFICATIONS_KEY) || "[]");

    if (currentEditingCertId !== null) {
        certs = certs.map(c => c.id === currentEditingCertId ? { id: currentEditingCertId, title, issuer, date, link, description } : c);
        currentEditingCertId = null;
    } else {
        const newCert = {
            id: Date.now(),
            title,
            issuer,
            date,
            link,
            description
        };
        certs.push(newCert);
    }

    localStorage.setItem(CERTIFICATIONS_KEY, JSON.stringify(certs));
    document.getElementById("certTitle").value = "";
    document.getElementById("certIssuer").value = "";
    document.getElementById("certDate").value = "";
    document.getElementById("certLink").value = "";
    document.getElementById("certDescription").value = "";
    renderCertificates();
    loadCertificationsToMain();
}

function editCertificate(id) {
    const certs = JSON.parse(localStorage.getItem(CERTIFICATIONS_KEY) || "[]");
    const cert = certs.find(c => c.id === id);
    if (cert) {
        document.getElementById("certTitle").value = cert.title;
        document.getElementById("certIssuer").value = cert.issuer;
        document.getElementById("certDate").value = cert.date;
        document.getElementById("certLink").value = cert.link || "";
        document.getElementById("certDescription").value = cert.description || "";
        currentEditingCertId = id;
        document.querySelector('button[onclick="addCertificate()"]').textContent = "✓ Update Certificate";
    }
}

function deleteCertificate(id) {
    if (confirm("Delete this certificate?")) {
        let certs = JSON.parse(localStorage.getItem(CERTIFICATIONS_KEY) || "[]");
        certs = certs.filter(c => c.id !== id);
        localStorage.setItem(CERTIFICATIONS_KEY, JSON.stringify(certs));
        renderCertificates();
        loadCertificationsToMain();
    }
}

function renderCertificates() {
    const certs = JSON.parse(localStorage.getItem(CERTIFICATIONS_KEY) || "[]");
    const list = document.getElementById("certsList");

    if (!certs.length) {
        list.innerHTML = "<p style='color: var(--muted);'>No certificates added yet.</p>";
        return;
    }

    list.innerHTML = certs.map(cert => `
        <div class="cert-item">
            <div class="cert-item-info">
                <h4>${cert.title}</h4>
                <p><strong>Issuer:</strong> ${cert.issuer}</p>
                <p><strong>Date:</strong> ${new Date(cert.date).toLocaleDateString()}</p>
                ${cert.description ? `<p>${cert.description}</p>` : ""}
            </div>
            <div class="cert-item-actions">
                <button type="button" class="btn-edit" onclick="editCertificate(${cert.id})">Edit</button>
                <button type="button" class="btn-delete" onclick="deleteCertificate(${cert.id})">Delete</button>
            </div>
        </div>
    `).join("");
}

function renderBookings() {
    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
    const list = document.getElementById("bookingsList");

    if (!bookings.length) {
        list.innerHTML = "<p style='color: var(--muted);'>No bookings yet.</p>";
        return;
    }

    list.innerHTML = bookings.map(booking => `
        <div class="booking-item">
            <h4>${booking.type === "project" ? "Project Booking" : "Session: " + booking.sessionType}</h4>
            <div class="booking-item-details">
                <div><strong>Name:</strong> ${booking.name}</div>
                <div><strong>Email:</strong> ${booking.email}</div>
                <div><strong>Date:</strong> ${booking.date}</div>
                <div><strong>Time:</strong> ${booking.time}</div>
                <div><strong>Budget:</strong> ${booking.budget || "Not specified"}</div>
                <div><strong>Status:</strong> <span style="color: var(--good);">Confirmed</span></div>
            </div>
            <p style="color: var(--muted); margin: 12px 0 0; font-size: 0.9rem;"><strong>Details:</strong> ${booking.details}</p>
        </div>
    `).join("");
}

function loadCertificationsToMain() {
    const certs = JSON.parse(localStorage.getItem(CERTIFICATIONS_KEY) || "[]");
    const grid = document.getElementById("certsGrid");
    if (grid) {
        grid.innerHTML = certs.map(cert => `
            <div class="cert-card" onclick="highlightCert(this)">
                <i class="fa-solid fa-certificate"></i>
                <h4>${cert.title}</h4>
                <p>${cert.issuer}</p>
                <p class="cert-date">${new Date(cert.date).getFullYear()}</p>
            </div>
        `).join("");
    }
}

function exportAdminData() {
    const data = {
        certifications: JSON.parse(localStorage.getItem(CERTIFICATIONS_KEY) || "[]"),
        bookings: JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]"),
        exportDate: new Date().toISOString()
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Navigation
document.querySelectorAll(".admin-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".admin-nav-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".admin-content").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        const section = btn.dataset.section;
        document.getElementById(section + "Content").classList.add("active");
        if (section === "bookings") {
            renderBookings();
        }
    });
});

// Logout
document.getElementById("adminLogout").addEventListener("click", () => {
    if (confirm("Logout?")) {
        window.location.href = "index.html";
    }
});

// Theme toggle
document.getElementById("themeToggleAdmin").addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark");
    document.body.classList.toggle("dark", !isDark);
    localStorage.setItem("portfolio-theme", !isDark ? "dark" : "light");
    const icon = document.getElementById("themeToggleAdmin").querySelector("i");
    icon.className = !isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
});

// Initialize
window.addEventListener("load", () => {
    checkAdminAuth();
    const savedTheme = localStorage.getItem("portfolio-theme") || "light";
    const isDark = savedTheme === "dark";
    document.body.classList.toggle("dark", isDark);
    const icon = document.getElementById("themeToggleAdmin").querySelector("i");
    icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    renderCertificates();
    loadCertificationsToMain();
});
