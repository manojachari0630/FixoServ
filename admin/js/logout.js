import { logoutUser } from "../../firebase/auth.js";

const logoutButtons = [

    document.getElementById("logoutBtn"),

    document.getElementById("sidebarLogout")

];

logoutButtons.forEach(button => {

    if (!button) return;

    button.addEventListener("click", async (e) => {

        e.preventDefault();

        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) return;

        try {

            await logoutUser();

            window.location.href = "../../login.html";

        }

        catch (error) {

            console.error(error);

            alert("Logout failed.");

        }

    });

});