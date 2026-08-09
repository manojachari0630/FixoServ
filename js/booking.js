import { auth, db } from "../firebase/firebase-config.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
const bookingsRef = collection(db, "bookings");

/*=========================================
LOGIN CHECK
=========================================*/

let currentUser = null;

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first to book a service.");

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

});

/*=========================================
FIXOSERV BOOKING SYSTEM
=========================================*/

const pages = document.querySelectorAll(".step-page");
const nextBtns = document.querySelectorAll(".next");
const prevBtns = document.querySelectorAll(".prev");
const steps = document.querySelectorAll(".step");
const progressBar = document.getElementById("progressBar");
const form = document.getElementById("bookingForm");
const successPopup = document.getElementById("successPopup");

let current = 0;

/*=========================================
SHOW STEP
=========================================*/

function showStep(index) {

    pages.forEach(page => page.classList.remove("active"));
    pages[index].classList.add("active");

    steps.forEach((step, i) => {

        if (i <= index) {

            step.classList.add("active");

        } else {

            step.classList.remove("active");

        }

    });

    progressBar.style.width =
        ((index + 1) / pages.length) * 100 + "%";

    updateSummary();

}

/*=========================================
VALIDATION
=========================================*/

function validateStep(step) {

    const required =
        pages[step].querySelectorAll("[required]");

    for (let input of required) {

       if (input.type === "checkbox") {

    const checked =
        pages[step].querySelectorAll('input[name="service"]:checked');

    if (checked.length === 0) {

        alert("Please select at least one service.");

        return false;

    }

}

        else if (input.value.trim() === "") {

            input.focus();

            alert("Please fill all required fields.");

            return false;

        }

    }

    return true;

}

/*=========================================
NEXT BUTTON
=========================================*/

nextBtns.forEach(button => {

    button.addEventListener("click", () => {

        if (!validateStep(current)) return;

        if (current < pages.length - 1) {

            current++;

            showStep(current);

        }

    });

});

/*=========================================
PREVIOUS BUTTON
=========================================*/

prevBtns.forEach(button => {

    button.addEventListener("click", () => {

        if (current > 0) {

            current--;

            showStep(current);

        }

    });

});

/*=========================================
SUMMARY
=========================================*/

function updateSummary() {

    const name = document.getElementById("name").value;

    const services =
[...document.querySelectorAll('input[name="service"]:checked')]
.map(service => service.value);

    const date =
        document.getElementById("date").value;

    const time =
        document.getElementById("time").value;

    document.getElementById("sumName").textContent =
        name || "-";

    document.getElementById("sumService").textContent =
services.length ? services.join(", ") : "-";

    document.getElementById("sumDate").textContent =
        date || "-";

    document.getElementById("sumTime").textContent =
        time || "-";

}

/*=========================================
LIVE UPDATE
=========================================*/

document.querySelectorAll("input,select").forEach(element => {

    element.addEventListener("change", updateSummary);

    element.addEventListener("keyup", updateSummary);

});

/*=========================================
PHONE VALIDATION
=========================================*/

const phone = document.getElementById("phone");

phone.addEventListener("input", function () {

    this.value =
        this.value.replace(/\D/g, "").slice(0, 10);

});

/*=========================================
EMAIL VALIDATION
=========================================*/

const email = document.getElementById("email");

email.addEventListener("blur", function () {

    if (this.value === "") return;

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!pattern.test(this.value)) {

        alert("Invalid Email Address");

        this.focus();

    }

});

/*=========================================
DATE VALIDATION
=========================================*/

const dateInput = document.getElementById("date");

const today =
    new Date().toISOString().split("T")[0];

dateInput.min = today;

/*=========================================
BOOKING ID
=========================================*/

async function generateBookingID() {

    const snapshot = await getDocs(bookingsRef);

    const bookingNumber = snapshot.size + 1;

    return "FXR" + String(bookingNumber).padStart(6, "0");

}

/*=========================================
FORM SUBMIT
=========================================*/

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    if (!validateStep(current)) {
        return;
    }

    try {

        if (!currentUser) {

    alert("Please login first.");

    window.location.href = "login.html";

    return;

}

    const checked =
document.querySelectorAll('input[name="service"]:checked');

if (checked.length === 0) {

    alert("Please select at least one service.");

    return;

}

        const bookingId = await generateBookingID();

        const services =
            [...document.querySelectorAll('input[name="service"]:checked')]
            .map(service => service.value);

        await addDoc(bookingsRef, {

            userId: currentUser.uid,

userEmail: currentUser.email,

            bookingId: bookingId,

            customerName: document.getElementById("name").value,

            phone: document.getElementById("phone").value,

            whatsapp: document.getElementById("whatsapp").value,

            email: document.getElementById("email").value,

            services: services,

            house: document.getElementById("house").value,

            street: document.getElementById("street").value,

            city: document.getElementById("city").value,

            pincode: document.getElementById("pincode").value,

            preferredDate: document.getElementById("date").value,

            preferredTime: document.getElementById("time").value,

            problem: document.getElementById("problem").value,

            status: "Pending",

            createdAt: serverTimestamp()

        });


        await addDoc(collection(db, "notifications"), {

    type: "booking",

    bookingId: bookingId,

    customerName: document.getElementById("name").value,

    message:
        document.getElementById("name").value +
        " booked " +
        services.join(", "),

    read: false,

    createdAt: serverTimestamp()

});

        document.getElementById("bookingId").textContent = bookingId;

        successPopup.style.display = "flex";

    }

    catch (error) {

        console.error(error);

        alert("Booking failed. Please try again.");

    }

});

/*=========================================
RESET
=========================================*/

document.querySelector(".home-btn")
.addEventListener("click", function () {

    form.reset();

    current = 0;

    showStep(0);

});

/*=========================================
INITIAL LOAD
=========================================*/

showStep(0);