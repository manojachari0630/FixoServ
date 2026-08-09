console.log("REGISTER JS IS RUNNING");

import { createNewUser } from "../firebase/register.js";

const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();

    const email = document.getElementById("email").value.trim();

    const phone = document.getElementById("phone").value.trim();

    const password = document.getElementById("password").value;

    const confirmPassword = document.getElementById("confirmPassword").value;

    if (
        fullName === "" ||
        email === "" ||
        phone === "" ||
        password === "" ||
        confirmPassword === ""
    ) {

        alert("Please fill all fields.");

        return;

    }

    if (password !== confirmPassword) {

        alert("Passwords do not match.");

        return;

    }

    if (password.length < 6) {

        alert("Password must be at least 6 characters.");

        return;

    }

    const result = await createNewUser(

        fullName,
        email,
        phone,
        password

    );

    if (result.success) {

        alert("Account Created Successfully.");

        window.location.href = "login.html";

    } else {

        alert(result.message);

    }

});

// ==========================
// PASSWORD EYE BUTTONS
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    const password = document.getElementById("password");
    const confirmPassword =
        document.getElementById("confirmPassword");

    const togglePassword =
        document.getElementById("togglePassword");

    const toggleConfirmPassword =
        document.getElementById("toggleConfirmPassword");


    // Password
    if (togglePassword && password) {

        togglePassword.onclick = function () {

            if (password.type === "password") {

                password.type = "text";

                this.classList.remove("fa-eye");
                this.classList.add("fa-eye-slash");

            } else {

                password.type = "password";

                this.classList.remove("fa-eye-slash");
                this.classList.add("fa-eye");

            }

        };

    }


    // Confirm Password
    if (toggleConfirmPassword && confirmPassword) {

        toggleConfirmPassword.onclick = function () {

            if (confirmPassword.type === "password") {

                confirmPassword.type = "text";

                this.classList.remove("fa-eye");
                this.classList.add("fa-eye-slash");

            } else {

                confirmPassword.type = "password";

                this.classList.remove("fa-eye-slash");
                this.classList.add("fa-eye");

            }

        };

    }

});

// ==========================
// PASSWORD VISIBILITY
// ==========================

const passwordInput = document.getElementById("password");
const confirmPasswordInput =
    document.getElementById("confirmPassword");

const passwordEye =
    document.getElementById("togglePassword");

const confirmPasswordEye =
    document.getElementById("toggleConfirmPassword");


// Password
if (passwordEye && passwordInput) {

    passwordEye.addEventListener("click", function () {

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


// Confirm Password
if (confirmPasswordEye && confirmPasswordInput) {

    confirmPasswordEye.addEventListener("click", function () {

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