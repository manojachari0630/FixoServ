import { db } from "../../firebase/firebase-config.js";

import {
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const settingsRef = doc(db, "settings", "admin");

let adminData = {};

// ==========================
// LOAD SETTINGS
// ==========================

onSnapshot(settingsRef, (snap) => {

    if (!snap.exists()) return;

    adminData = snap.data();

    // Admin Name
    const adminName = document.getElementById("adminDisplayName");

    if (adminName) {

        adminName.textContent =
            adminData.adminName || "Admin";

    }

    // Popup Data
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profilePhone = document.getElementById("profilePhone");

    if (profileName) {

        profileName.textContent =
            adminData.adminName || "-";

    }

    if (profileEmail) {

        profileEmail.textContent =
            adminData.adminEmail || "-";

    }

    if (profilePhone) {

        profilePhone.textContent =
            adminData.adminPhone || "-";

    }

    // Theme
   if (adminData.theme === "dark") {

    document.body.classList.add("dark");

} else {

    document.body.classList.remove("dark");

}

});

// ==========================
// PROFILE POPUP
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    const adminProfile =
        document.getElementById("adminProfile");

    const adminModal =
        document.getElementById("adminModal");

    const closeAdmin =
        document.getElementById("closeAdmin");

    if (adminProfile && adminModal) {

        adminProfile.onclick = () => {

            adminModal.style.display = "flex";

        };

    }

    if (closeAdmin) {

        closeAdmin.onclick = () => {

            adminModal.style.display = "none";

        };

    }

    window.onclick = (e) => {

        if (e.target === adminModal) {

            adminModal.style.display = "none";

        }

    };

});