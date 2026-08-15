console.log("REGISTER JS IS RUNNING");

import { createNewUser } from "../firebase/register.js";

const registerForm = document.getElementById("registerForm");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const registerBtn = document.getElementById("registerBtn");
const loading = document.getElementById("loadingScreen");
const error = document.getElementById("registerError");

let isRegistering = false;


/* ==========================================
   REGISTER FORM
========================================== */

registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    // Prevent double-click / duplicate request
    if (isRegistering) {
        return;
    }

    error.textContent = "";

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;


    /* ==========================================
       VALIDATION
    ========================================== */

    if (
        fullName === "" ||
        email === "" ||
        phone === "" ||
        password === "" ||
        confirmPassword === ""
    ) {

        error.textContent = "Please fill all fields.";
        return;

    }


    if (password !== confirmPassword) {

        error.textContent = "Passwords do not match.";
        return;

    }


    if (password.length < 6) {

        error.textContent = "Password must be at least 6 characters.";
        return;

    }


    /* ==========================================
       START REGISTRATION
    ========================================== */

    isRegistering = true;

    registerBtn.disabled = true;

    if (loading) {
        loading.style.display = "flex";
    }


    try {

        const result = await createNewUser(
            fullName,
            email,
            phone,
            password
        );


        if (result.success) {

            alert("Account Created Successfully.");

            window.location.href = "login.html";

            return;

        }


        error.textContent = result.message;


    } catch (err) {

        console.error("Registration error:", err);

        error.textContent =
            err.message || "Registration failed.";

    }


    /* ==========================================
       RESET BUTTON
    ========================================== */

    isRegistering = false;

    registerBtn.disabled = false;

    if (loading) {
        loading.style.display = "none";
    }

});


/* ==========================================
   PASSWORD EYE
========================================== */

const passwordEye =
    document.getElementById("togglePassword");

if (passwordEye) {

    passwordEye.addEventListener("click", (e) => {

        e.preventDefault();

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            passwordEye.classList.remove("fa-eye");

            passwordEye.classList.add("fa-eye-slash");

        } else {

            passwordInput.type = "password";

            passwordEye.classList.remove("fa-eye-slash");

            passwordEye.classList.add("fa-eye");

        }

    });

}


/* ==========================================
   CONFIRM PASSWORD EYE
========================================== */

const confirmPasswordEye =
    document.getElementById("toggleConfirmPassword");

if (confirmPasswordEye) {

    confirmPasswordEye.addEventListener("click", (e) => {

        e.preventDefault();

        if (confirmPasswordInput.type === "password") {

            confirmPasswordInput.type = "text";

            confirmPasswordEye.classList.remove("fa-eye");

            confirmPasswordEye.classList.add("fa-eye-slash");

        } else {

            confirmPasswordInput.type = "password";

            confirmPasswordEye.classList.remove("fa-eye-slash");

            confirmPasswordEye.classList.add("fa-eye");

        }

    });

}