import {
    loginUser,
    forgotPassword
} from "./auth.js";

export async function adminOrUserLogin(email, password) {

    try {

        const userData = await loginUser(email, password);

        if (userData.role === "admin") {

            return {
                success: true,
                role: "admin",
                redirect: "admin/dashboard/dashboard.html"
            };

        }

        return {

            success: true,
            role: "user",
            redirect: "index.html"

        };

    }

    catch (error) {

        console.error(error);

        return {

            success: false,
            message: error.message

        };

    }

}

// ==========================
// FORGOT PASSWORD
// ==========================

const forgotPasswordLink =
    document.getElementById("forgotPassword");

const forgotModal =
    document.getElementById("forgotModal");

const closeForgot =
    document.getElementById("closeForgot");

const sendReset =
    document.getElementById("sendReset");

const resetEmail =
    document.getElementById("resetEmail");

const resetMessage =
    document.getElementById("resetMessage");


forgotPasswordLink.addEventListener("click", (e) => {

    e.preventDefault();

    forgotModal.classList.add("show");

});


closeForgot.addEventListener("click", () => {

    forgotModal.classList.remove("show");

});


sendReset.addEventListener("click", async () => {

    const email = resetEmail.value.trim();

    if (!email) {

        resetMessage.textContent =
            "Please enter your email address.";

        resetMessage.style.color = "red";

        return;

    }

    try {

        sendReset.disabled = true;

        sendReset.textContent = "Sending...";

        await forgotPassword(email);

        resetMessage.textContent =
            "Password reset link sent! Check your email.";

        resetMessage.style.color = "green";

        resetEmail.value = "";

    }

    catch (error) {

        console.error(error);

        resetMessage.textContent =
            "Unable to send reset email. Please check the email address.";

        resetMessage.style.color = "red";

    }

    finally {

        sendReset.disabled = false;

        sendReset.textContent =
            "Send Reset Link";

    }

});