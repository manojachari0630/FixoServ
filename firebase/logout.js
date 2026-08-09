import { logoutUser } from "./auth.js";

/* ==========================================
   LOGOUT FUNCTION
========================================== */

export async function logout() {

    try {

        await logoutUser();

        localStorage.clear();

        sessionStorage.clear();

        window.location.href = "../../login.html";

    }

    catch (error) {

        console.error(error);

        alert("Logout Failed.");

    }

}

/* ==========================================
   ATTACH TO BUTTON
========================================== */

export function setupLogout(buttonId) {

    const button = document.getElementById(buttonId);

    if (!button) return;

    button.addEventListener("click", async () => {

        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) return;

        await logout();

    });

}