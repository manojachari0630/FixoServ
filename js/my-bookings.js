import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


/* ==========================================
   ELEMENTS
========================================== */

const bookingList =
    document.getElementById("bookingList");

const searchBooking =
    document.getElementById("searchBooking");

const detailsModal =
    document.getElementById("detailsModal");

const bookingDetails =
    document.getElementById("bookingDetails");

const closeModal =
    document.getElementById("closeModal");


/* ==========================================
   VARIABLES
========================================== */

let currentFilter = "all";

let allBookings = [];

let unsubscribeBookings = null;


/* ==========================================
   CLOSE MODAL
========================================== */

if (closeModal) {

    closeModal.onclick = () => {

        detailsModal.style.display = "none";

    };

}


window.onclick = (e) => {

    if (e.target === detailsModal) {

        detailsModal.style.display = "none";

    }

};


/* ==========================================
   AUTHENTICATION
========================================== */

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    loadBookings(user.uid);

});


/* ==========================================
   LOAD BOOKINGS
========================================== */

function loadBookings(uid) {

    const bookingsRef =
        collection(db, "bookings");


    /*
       IMPORTANT:
       Only using where(userId == uid).

       This does NOT require the
       userId + createdAt composite index.
    */

    const q = query(

        bookingsRef,

        where("userId", "==", uid)

    );


    /* Remove previous listener */

    if (unsubscribeBookings) {

        unsubscribeBookings();

    }


    unsubscribeBookings = onSnapshot(

        q,

        (snapshot) => {

            allBookings = [];


            snapshot.forEach((bookingDoc) => {

                allBookings.push({

                    id: bookingDoc.id,

                    ...bookingDoc.data()

                });

            });


            /* ==========================================
               SORT BY CREATED DATE
            ========================================== */

            allBookings.sort((a, b) => {

                const dateA =
                    a.createdAt?.toMillis
                        ? a.createdAt.toMillis()
                        : 0;

                const dateB =
                    b.createdAt?.toMillis
                        ? b.createdAt.toMillis()
                        : 0;

                return dateB - dateA;

            });


            renderBookings();

        },


        (error) => {

            console.error(
                "MY BOOKINGS FIRESTORE ERROR:",
                error
            );

            bookingList.innerHTML = `

                <div class="booking-card">

                    <h3>Unable to Load Bookings</h3>

                    <p>
                        ${error.message}
                    </p>

                </div>

            `;

        }

    );

}


/* ==========================================
   RENDER BOOKINGS
========================================== */

function renderBookings() {

    bookingList.innerHTML = "";


    let total = 0;

    let pending = 0;

    let accepted = 0;

    let completed = 0;

    let cancelled = 0;


    const searchText =
        (searchBooking?.value || "")
        .trim()
        .toLowerCase();


    /* ==========================================
       FILTER BOOKINGS
    ========================================== */

    const filteredBookings =
        allBookings.filter((data) => {

            const bookingId =
                (data.bookingId || "")
                .toLowerCase();


            const status =
                (data.status || "")
                .toLowerCase();


            /* Search */

            if (
                searchText &&
                !bookingId.includes(searchText)
            ) {

                return false;

            }


            /* Status filter */

            if (
                currentFilter !== "all" &&
                status !== currentFilter
            ) {

                return false;

            }


            return true;

        });


    /* ==========================================
       COUNTS
    ========================================== */

    allBookings.forEach((data) => {

        const status =
            (data.status || "")
            .toLowerCase();


        switch (status) {

            case "pending":

                pending++;

                break;


            case "accepted":

                accepted++;

                break;


            case "completed":

                completed++;

                break;


            case "cancelled":

                cancelled++;

                break;

        }

    });


    total = allBookings.length;


    /* ==========================================
       UPDATE COUNTERS
    ========================================== */

    const totalElement =
        document.getElementById("totalBookings");

    const pendingElement =
        document.getElementById("pendingBookings");

    const acceptedElement =
        document.getElementById("acceptedBookings");

    const completedElement =
        document.getElementById("completedBookings");

    const cancelledElement =
        document.getElementById("cancelledBookings");


    if (totalElement)
        totalElement.textContent = total;


    if (pendingElement)
        pendingElement.textContent = pending;


    if (acceptedElement)
        acceptedElement.textContent = accepted;


    if (completedElement)
        completedElement.textContent = completed;


    if (cancelledElement)
        cancelledElement.textContent = cancelled;


    /* ==========================================
       NO BOOKINGS
    ========================================== */

    if (filteredBookings.length === 0) {

        bookingList.innerHTML = `

            <div class="booking-card">

                <h3>
                    ${
                        allBookings.length === 0
                        ? "No Bookings Found"
                        : "No Matching Bookings"
                    }
                </h3>

                <p>
                    ${
                        allBookings.length === 0
                        ? "You haven't booked any services yet."
                        : "Try changing your search or filter."
                    }
                </p>

            </div>

        `;

        return;

    }


    /* ==========================================
       DISPLAY BOOKINGS
    ========================================== */

    filteredBookings.forEach((data) => {

        const bookingId =
            data.bookingId || "N/A";


        const status =
            (data.status || "Pending")
            .toLowerCase();


        let statusClass = "";


        switch (status) {

            case "pending":

                statusClass = "pending";

                break;


            case "accepted":

                statusClass = "accepted";

                break;


            case "completed":

                statusClass = "completed";

                break;


            case "cancelled":

                statusClass = "cancelled";

                break;


            default:

                statusClass = "pending";

        }


        const services =
            Array.isArray(data.services)
                ? data.services.join(", ")
                : data.services || "N/A";


        bookingList.innerHTML += `

            <div class="booking-card">

                <h3>
                    ${bookingId}
                </h3>


                <p>
                    <strong>Service :</strong>
                    ${services}
                </p>


                <p>
                    <strong>Date :</strong>
                    ${data.preferredDate || "N/A"}
                </p>


                <p>
                    <strong>Time :</strong>
                    ${data.preferredTime || "N/A"}
                </p>


                <span class="status ${statusClass}">

                    ${data.status || "Pending"}

                </span>


                <div class="card-buttons">


                    <button
                        class="view-btn"
                        onclick="viewBooking('${data.id}')">

                        View Details

                    </button>


                    ${
                        ["pending", "accepted"]
                        .includes(status)

                        ?

                        `<button
                            class="cancel-btn"
                            onclick="cancelBooking('${data.id}')">

                            Cancel Booking

                        </button>`

                        :

                        ""
                    }


                </div>

            </div>

        `;

    });

}


/* ==========================================
   VIEW BOOKING DETAILS
========================================== */

window.viewBooking = async function (id) {

    try {

        const snap =
            await getDoc(
                doc(db, "bookings", id)
            );


        if (!snap.exists()) {

            alert("Booking not found.");

            return;

        }


        const data = snap.data();


        const services =
            Array.isArray(data.services)
                ? data.services.join(", ")
                : data.services || "N/A";


        bookingDetails.innerHTML = `

            <p>
                <strong>Booking ID :</strong>
                ${data.bookingId || "N/A"}
            </p>


            <p>
                <strong>Name :</strong>
                ${data.customerName || "N/A"}
            </p>


            <p>
                <strong>Phone :</strong>
                ${data.phone || "N/A"}
            </p>


            <p>
                <strong>Email :</strong>
                ${data.email || "N/A"}
            </p>


            <p>
                <strong>Services :</strong>
                ${services}
            </p>


            <p>
                <strong>Address :</strong><br>

                ${data.house || ""}<br>

                ${data.street || ""}<br>

                ${data.city || ""} -
                ${data.pincode || ""}
            </p>


            <p>
                <strong>Date :</strong>
                ${data.preferredDate || "N/A"}
            </p>


            <p>
                <strong>Time :</strong>
                ${data.preferredTime || "N/A"}
            </p>


            <p>
                <strong>Problem :</strong><br>

                ${data.problem || "N/A"}
            </p>


            <p>
                <strong>Status :</strong>
                ${data.status || "Pending"}
            </p>

        `;


        detailsModal.style.display = "flex";

    }

    catch (error) {

        console.error(
            "VIEW BOOKING ERROR:",
            error
        );

        alert("Unable to load booking details.");

    }

};


/* ==========================================
   SEARCH
========================================== */

if (searchBooking) {

    searchBooking.addEventListener(
        "input",
        () => {

            renderBookings();

        }
    );

}


/* ==========================================
   FILTER
========================================== */

document
    .querySelectorAll(".filter-btn")
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter-btn")
                    .forEach((btn) => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter
                    || "all";


                renderBookings();

            }
        );

    });


/* ==========================================
   CANCEL BOOKING
========================================== */

window.cancelBooking = async function (
    bookingId
) {

    const confirmCancel =
        confirm(
            "Are you sure you want to cancel this booking?"
        );


    if (!confirmCancel) {

        return;

    }


    try {

        await updateDoc(

            doc(
                db,
                "bookings",
                bookingId
            ),

            {
                status: "Cancelled"
            }

        );


        alert(
            "Booking Cancelled Successfully."
        );


    }

    catch (error) {

        console.error(
            "CANCEL BOOKING ERROR:",
            error
        );

        alert(
            "Unable to cancel booking."
        );

    }

};