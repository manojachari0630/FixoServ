import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const bookingList =
document.getElementById("bookingList");

const searchBooking =
document.getElementById("searchBooking");

let currentFilter = "all";

const detailsModal =
document.getElementById("detailsModal");

const bookingDetails =
document.getElementById("bookingDetails");

const closeModal =
document.getElementById("closeModal");

closeModal.onclick = ()=>{

    detailsModal.style.display="none";

};

window.onclick=(e)=>{

    if(e.target===detailsModal){

        detailsModal.style.display="none";

    }

};

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    loadBookings(user.uid);

});
function loadBookings(uid){

    const bookingsRef = collection(db,"bookings");

    const q = query(

        bookingsRef,

        where("userId","==",uid),

        orderBy("createdAt","desc")

    );

    onSnapshot(q,(snapshot)=>{

    bookingList.innerHTML="";

    let total=0;
    let pending=0;
    let accepted=0;
    let completed=0;
    let cancelled=0;

        if(snapshot.empty){

            bookingList.innerHTML=`

                <div class="booking-card">

                    <h3>No Bookings Found</h3>

                    <p>You haven't booked any services yet.</p>

                </div>

            `;

            return;

        }

        snapshot.forEach((doc)=>{

            const data = doc.data();

            const bookingId =
(data.bookingId || "").toLowerCase();

const status =
(data.status || "").toLowerCase();

const searchText =
searchBooking.value.toLowerCase();

/* Search */

if(
    bookingId.indexOf(searchText) === -1
){
    return;
}

/* Filter */

if(
    currentFilter !== "all"
    &&
    status !== currentFilter
){
    return;
}

            total++;

switch((data.status || "").toLowerCase()){

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

            let statusClass = "";

            switch((data.status || "").toLowerCase()){

                case "pending":
                    statusClass="pending";
                    break;

                case "confirmed":
                    statusClass="confirmed";
                    break;

                case "completed":
                    statusClass="completed";
                    break;

                case "cancelled":
                    statusClass="cancelled";
                    break;

                default:
                    statusClass="pending";

            }

            bookingList.innerHTML += `

                <div class="booking-card">

                    <h3>${data.bookingId}</h3>

                    <p><strong>Service :</strong> ${(data.services || []).join(", ")}</p>

                    <p><strong>Date :</strong> ${data.preferredDate}</p>

                    <p><strong>Time :</strong> ${data.preferredTime}</p>

                    <span class="status ${statusClass}">
                        ${data.status}
                    </span>

                    <div class="card-buttons">

                        <button
                            class="view-btn"
                            onclick="viewBooking('${doc.id}')">

                            View Details

                        </button>

${
    ["pending","accepted"].includes(
        (data.status || "").toLowerCase()
    )

    ?

    `<button
        class="cancel-btn"
        onclick="cancelBooking('${doc.id}')">

        Cancel Booking

    </button>`

    :

    ""
}
                    </div>

                </div>

            `;

        });

        document.getElementById("totalBookings").textContent = total;

document.getElementById("pendingBookings").textContent = pending;

document.getElementById("acceptedBookings").textContent = accepted;

document.getElementById("completedBookings").textContent = completed;

document.getElementById("cancelledBookings").textContent = cancelled;

    });

}
/* ==========================================
VIEW BOOKING DETAILS
========================================== */

window.viewBooking = async function(id){

    const { getDoc, doc } =
    await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js");

    const snap = await getDoc(doc(db,"bookings",id));

    if(!snap.exists()) return;

    const data = snap.data();

    bookingDetails.innerHTML=`

        <p><strong>Booking ID :</strong> ${data.bookingId}</p>

        <p><strong>Name :</strong> ${data.customerName}</p>

        <p><strong>Phone :</strong> ${data.phone}</p>

        <p><strong>Email :</strong> ${data.email}</p>

        <p><strong>Services :</strong> ${(data.services || []).join(", ")}</p>

        <p><strong>Address :</strong><br>
        ${data.house}<br>
        ${data.street}<br>
        ${data.city} - ${data.pincode}
        </p>

        <p><strong>Date :</strong> ${data.preferredDate}</p>

        <p><strong>Time :</strong> ${data.preferredTime}</p>

        <p><strong>Problem :</strong><br>${data.problem}</p>

        <p><strong>Status :</strong> ${data.status}</p>

    `;

    detailsModal.style.display="flex";

};



/* ==========================================
SEARCH
========================================== */

searchBooking.addEventListener("input",()=>{

    loadBookings(auth.currentUser.uid);

});

/* ==========================================
FILTER
========================================== */

document
.querySelectorAll(".filter-btn")
.forEach((button)=>{

    button.addEventListener("click",()=>{

        document
        .querySelectorAll(".filter-btn")
        .forEach(btn=>btn.classList.remove("active"));

        button.classList.add("active");

        currentFilter =
        button.dataset.filter;

        loadBookings(auth.currentUser.uid);

    });

});

/* ==========================================
   CANCEL BOOKING
========================================== */

window.cancelBooking = async function (bookingId) {

    const confirmCancel = confirm(
        "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {

        await updateDoc(
            doc(db, "bookings", bookingId),
            {
                status: "Cancelled"
            }
        );

        alert("Booking Cancelled Successfully.");

    }

    catch (error) {

        console.error(error);

        alert("Unable to cancel booking.");

    }

};