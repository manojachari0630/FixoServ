


// =======================================================
// FIXOSERV BOOKING MANAGEMENT SYSTEM
// bookings.js
// Part 1 - Imports, Setup & Helper Functions
// =======================================================

import { db } from "../../firebase/firebase-config.js";

import {
    collection,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// =======================================================
// FIREBASE COLLECTION
// =======================================================

const workersRef = collection(db, "workers");

const bookingsRef = collection(db, "bookings");

const settingsRef = doc(db, "settings", "admin");
// =======================================================
// GLOBAL VARIABLES
// =======================================================
let bookingChart;

let bookingList = [];

let filteredBookings = [];

let currentPage = 1;

const rowsPerPage = 5;

let selectedBookingId = null;

let rejectBookingId = null;

let completeBookingId = null;

let feedbackBookingId = null;

// Dashboard Counters
let totalBookings = 0;
let pendingBookings = 0;
let acceptedBookings = 0;
let progressBookings = 0;
let completedBookings = 0;
let cancelledBookings = 0;

// =======================================================
// DOM ELEMENTS
// =======================================================

// Sidebar

const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.querySelector(".toggle");

// Search

const searchInput = document.querySelector(".search input");

// Table

const bookingTableBody =
document.getElementById("bookingTableBody");

// Dashboard Cards

const totalCard =
document.getElementById("totalBookings");

const pendingCard =
document.getElementById("pendingBookings");

const completedCard =
document.getElementById("completedBookings");

const cancelledCard =
document.getElementById("cancelledBookings");

// =======================================================
// MODALS
// =======================================================

const bookingModal =
document.getElementById("bookingModal");

const rejectModal =
document.getElementById("rejectModal");

const completeModal =
document.getElementById("completeModal");

const feedbackModal =
document.getElementById("feedbackModal");

// =======================================================
// CLOSE BUTTONS
// =======================================================

const closeBookingModal =
document.querySelector(".close-modal");

const closeRejectModal =
document.querySelector(".close-reject");

const closeCompleteModal =
document.querySelector(".closeComplete");

const closeFeedbackModal =
document.querySelector(".closeFeedback");

// =======================================================
// SIDEBAR
// =======================================================

toggleBtn?.addEventListener("click", () => {

    sidebar.classList.toggle("collapsed");

});

// =======================================================
// CLOSE ALL MODALS
// =======================================================

function closeAllModals() {

    bookingModal?.classList.remove("show");

    rejectModal?.classList.remove("show");

    completeModal?.classList.remove("show");

    feedbackModal?.classList.remove("show");

}

closeBookingModal?.addEventListener("click", closeAllModals);

closeRejectModal?.addEventListener("click", closeAllModals);

closeCompleteModal?.addEventListener("click", closeAllModals);

closeFeedbackModal?.addEventListener("click", closeAllModals);

window.addEventListener("click", (e) => {

    if (e.target.classList.contains("modal")) {

        closeAllModals();

    }

});

// =======================================================
// STATUS BADGE
// =======================================================

function getStatusBadge(status) {

    switch (status) {

        case "Pending":

            return `<span class="pending">Pending</span>`;

        case "Accepted":

            return `<span class="accepted">Accepted</span>`;

        case "In Progress":

            return `<span class="inprogress">In Progress</span>`;

        case "Completed":

            return `<span class="completed">Completed</span>`;

        case "Cancelled":

            return `<span class="cancelled">Cancelled</span>`;

        default:

            return `<span class="pending">Pending</span>`;
    }

}

// =======================================================
// ACTION BUTTONS
// =======================================================

function getActionButtons(id, status) {

     console.log("getActionButtons Status:", status);

    switch (status) {

        case "Pending":

            return `

            <div class="actions">

                <button class="view-btn" data-id="${id}" title="View Booking">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button class="accept-btn" data-id="${id}" title="Accept Booking">

                    <i class="fa-solid fa-check"></i>

                </button>

                <button class="reject-btn" data-id="${id}" title="Reject Booking">

                    <i class="fa-solid fa-xmark"></i>

                </button>

            </div>

            `;

        case "Accepted":

            return `

            <div class="actions">

                <button class="view-btn" data-id="${id}" title="View Booking">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button class="start-btn" data-id="${id}" title="Start Work">

                    <i class="fa-solid fa-play"></i>

                </button>

                <button class="cancel-btn" data-id="${id}" title="Cancel Booking">

                    <i class="fa-solid fa-ban"></i>

                </button>

            </div>

            `;

        case "In Progress":

            return `

            <div class="actions">

                <button class="view-btn" data-id="${id}" title="View Booking">

                    <i class="fa-solid fa-eye"></i>

                </button>

                <button class="complete-btn" data-id="${id}" title="Complete Work">

                    <i class="fa-solid fa-circle-check"></i>

                </button>

            </div>

            `;

        case "Completed":

            return `

            <div class="actions">

                <button class="view-btn" data-id="${id}" title="View Booking">

                    <i class="fa-solid fa-eye"></i>

                </button>

               

            </div>

            `;

        case "Cancelled":

            return `

            <div class="actions">

                <button class="view-btn" data-id="${id}" title="View Booking">

                    <i class="fa-solid fa-eye"></i>

                </button>

            </div>

            `;

        default:

            return "";
    }

}

// =======================================================
// PART 1 COMPLETED
// =======================================================
// =======================================================
// LOAD BOOKINGS FROM FIREBASE
// =======================================================

async function loadBookings() {

    try {

        bookingTableBody.innerHTML = "";

        bookingList = [];

        totalBookings = 0;
        pendingBookings = 0;
        acceptedBookings = 0;
        progressBookings = 0;
        completedBookings = 0;
        cancelledBookings = 0;

        const bookingsQuery = query(
    bookingsRef,
    orderBy("createdAt", "desc")
);

const snapshot = await getDocs(bookingsQuery);

        if (snapshot.empty) {

            bookingTableBody.innerHTML = `

            <tr>

                <td colspan="7" style="text-align:center;padding:40px;">

                    No Bookings Found

                </td>

            </tr>

            `;

            updateDashboard();

            return;

        }

        snapshot.forEach((bookingDoc) => {

            const booking = bookingDoc.data();

            booking.id = bookingDoc.id;

            bookingList.push(booking);

            totalBookings++;

            switch ((booking.status || "Pending").trim()) {

                case "Pending":

                    pendingBookings++;

                    break;

                case "Accepted":

                    acceptedBookings++;

                    break;

                case "In Progress":

                    progressBookings++;

                    break;

                case "Completed":

                    completedBookings++;

                    break;

                case "Cancelled":

                    cancelledBookings++;

                    break;

            }

            


            

        });

        updateDashboard();

        currentPage = 1;

displayBookings(bookingList);

    }

    catch (error) {

        console.error(error);

    }

}
// =======================================================
// UPDATE DASHBOARD
// =======================================================

function updateDashboard() {

    totalCard.textContent = totalBookings;

    pendingCard.textContent = pendingBookings;

    completedCard.textContent = completedBookings;

    cancelledCard.textContent = cancelledBookings;

}
// =======================================================
// CREATE BOOKING ROW
// =======================================================

function createBookingRow(booking) {

    bookingTableBody.innerHTML += `


<tr>

<td>${booking.bookingId || "-"}</td>

<td>${booking.customerName || "-"}</td>

<td>${booking.phone || "-"}</td>

<td>${booking.services?.join(", ") || "-"}</td>

<td>${booking.preferredDate || "-"}</td>

<td>

${getStatusBadge(booking.status || "Pending")}

</td>

<td>

${getActionButtons(booking.id, (booking.status || "Pending").trim())}

</td>

</tr>

`;

}

function displayBookings(list){

    filteredBookings = list;

    bookingTableBody.innerHTML = "";

    if(filteredBookings.length===0){

        bookingTableBody.innerHTML=`

        <tr>

            <td colspan="7" style="text-align:center;padding:30px;">

                No Bookings Found

            </td>

        </tr>

        `;

        return;

    }

    const start = (currentPage-1)*rowsPerPage;

    const end = start + rowsPerPage;

    const pageData = filteredBookings.slice(start,end);

    pageData.forEach(booking=>{

        createBookingRow(booking);

    });

    updatePagination();

}


function updatePagination(){

    const pagination=document.querySelector(".pagination");

    pagination.innerHTML="";

    const totalPages=Math.ceil(filteredBookings.length/rowsPerPage);

    if(totalPages<=1) return;

    pagination.innerHTML+=`

    <button onclick="changePage(${currentPage-1})">

        <i class="fa-solid fa-angle-left"></i>

    </button>

    `;

    for(let i=1;i<=totalPages;i++){

        pagination.innerHTML+=`

        <button

        class="${i===currentPage?"active":""}"

        onclick="changePage(${i})">

        ${i}

        </button>

        `;

    }

    pagination.innerHTML+=`

    <button onclick="changePage(${currentPage+1})">

        <i class="fa-solid fa-angle-right"></i>

    </button>

    `;

}



window.changePage=function(page){

    const totalPages=Math.ceil(filteredBookings.length/rowsPerPage);

    if(page<1 || page>totalPages){

        return;

    }

    currentPage=page;

    displayBookings(filteredBookings);

}

// =======================================================
// REFRESH BOOKINGS
// =======================================================

function refreshBookings() {

    loadBookings();

}
// =======================================================
// PAGE LOAD
// =======================================================

window.addEventListener("load", () => {

    loadBookings();

});
// =======================================================
// VIEW BOOKING
// =======================================================

async function openBooking(id){

    try{

        const snapshot = await getDoc(doc(db,"bookings",id));

        if(!snapshot.exists()) return;

        const booking = snapshot.data();

        selectedBookingId=id;

        document.getElementById("modalBookingId").textContent=
        booking.bookingId || "-";

        document.getElementById("modalCustomerName").textContent=
        booking.customerName || "-";

        document.getElementById("modalPhone").textContent=
        booking.phone || "-";

        document.getElementById("modalAddress").textContent=
        `${booking.house || ""}, ${booking.street || ""}, ${booking.city || ""} - ${booking.pincode || ""}`;

        document.getElementById("modalService").textContent=
        booking.services?.join(", ") || "-";

        document.getElementById("modalDate").textContent=
        `${booking.preferredDate || "-"}  ${booking.preferredTime || ""}`;

        document.getElementById("modalStatus").textContent=
        booking.status || "Pending";

        document.getElementById("modalProblem").textContent =
        booking.problem || "No problem description";

        bookingModal.classList.add("show");

    }

    catch(err){

        console.error(err);

    }

}
// =======================================================
// VIEW BUTTON
// =======================================================

document.addEventListener("click",(e)=>{

    const btn=e.target.closest(".view-btn");

    if(!btn) return;

    openBooking(btn.dataset.id);

});
// =======================================================
// ACCEPT BOOKING
// =======================================================
async function acceptBooking(id) {

    if (!confirm("Accept this booking?")) return;

    try {

        // Update Firestore
        await updateDoc(doc(db, "bookings", id), {
            status: "Accepted",
            acceptedOn: new Date().toLocaleString()
        });

        // Get updated booking
        const booking = bookingList.find(b => b.id === id);

        // Send WhatsApp
        if (booking) {

            const message = `🏠 *FIXOSERV*

Hello ${booking.customerName},

✅ Your booking has been *ACCEPTED*.

━━━━━━━━━━━━━━

📌 Booking ID : ${booking.bookingId}

🛠 Service : ${booking.services.join(", ")}

📅 Preferred Date : ${booking.preferredDate}

━━━━━━━━━━━━━━

Our team will assign a worker shortly.

Thank you for choosing *FixoServ*.`;

            sendWhatsApp(booking.phone, message);

        }

        // Update local data immediately
        bookingList = bookingList.map(b => {
            if (b.id === id) {
                return {
                    ...b,
                    status: "Accepted",
                    acceptedOn: new Date().toLocaleString()
                };
            }
            return b;
        });

        // Refresh table
        currentPage = 1;

displayBookings(bookingList);

updateDashboard();

        alert("Booking Accepted Successfully.");

    }

    catch (err) {

        console.error(err);

    }

}

document.addEventListener("click", (e) => {

    const btn = e.target.closest(".accept-btn");

    if (!btn) return;

    acceptBooking(btn.dataset.id);

});
// =======================================================
// OPEN REJECT MODAL
// =======================================================

document.addEventListener("click",(e)=>{

    const btn=e.target.closest(".reject-btn");

    if(!btn) return;

    rejectBookingId=btn.dataset.id;

    document.getElementById("rejectReason").value="";

    rejectModal.classList.add("show");

});
// =======================================================
// REJECT BOOKING
// =======================================================

document.getElementById("confirmReject")
.addEventListener("click", async () => {

    const reason =
        document.getElementById("rejectReason").value.trim();

    if (reason === "") {
        alert("Please enter rejection reason.");
        return;
    }

    try {

        // Find booking
        const booking =
            bookingList.find(b => b.id === rejectBookingId);

        if (!booking) {
            alert("Booking not found.");
            return;
        }

        // ==========================================
        // 1. UPDATE BOOKING
        // ==========================================

        await updateDoc(
            doc(db, "bookings", rejectBookingId),
            {
                status: "Cancelled",
                rejectReason: reason,
                rejectedOn: new Date().toLocaleString()
            }
        );

        console.log("Booking cancelled successfully");


        // ==========================================
        // 2. CREATE NOTIFICATION
        // ==========================================

        try {

            await addDoc(
                collection(db, "notifications"),
                {
                    type: "cancel",

                    bookingId: rejectBookingId,

                    customerName:
                        booking.customerName || "",

                    message:
                        "Booking " +
                        rejectBookingId +
                        " was cancelled",

                    read: false,

                    createdAt: serverTimestamp()
                }
            );

            console.log("Notification created successfully");

        } catch (notificationError) {

            console.error(
                "Notification Error:",
                notificationError
            );

        }


        // ==========================================
        // 3. SEND WHATSAPP
        // ==========================================

        if (booking.phone) {

            const message =
`Hello ${booking.customerName || "Customer"},

Your booking has been cancelled.

Booking ID: ${booking.bookingId || rejectBookingId}

Reason:
${reason}

Thank you,
FixoServ Team`;

            try {

                sendWhatsApp(
                    booking.phone,
                    message
                );

                console.log(
                    "WhatsApp message opened successfully"
                );

            } catch (whatsappError) {

                console.error(
                    "WhatsApp Error:",
                    whatsappError
                );

            }

        } else {

            console.warn(
                "No phone number found for this booking."
            );

        }


        // ==========================================
        // 4. CLOSE MODAL
        // ==========================================

        rejectModal.classList.remove("show");

        document.getElementById("rejectReason").value = "";


        // ==========================================
        // 5. SUCCESS
        // ==========================================

        alert("Booking Rejected Successfully.");

        loadBookings();

    }

    catch (error) {

        console.error(
            "Reject Booking Error:",
            error
        );

        alert(
            "Unable to reject booking. Please check the console."
        );

    }

});
// =======================================================
// NOTIFICATION HELPER
// =======================================================

function notifyCustomer(booking,type){

    console.log("Notification Type :",type);

    console.log(booking);

}

const assignWorkerModal =
document.getElementById("assignWorkerModal");

let assignBookingId = null;
document.addEventListener("click", async (e) => {

    const btn = e.target.closest(".assign-btn");

    if (!btn) return;

    assignBookingId = btn.dataset.id;

    await loadWorkers();

    assignWorkerModal.classList.add("show");

});
async function loadWorkers() {

    const select = document.getElementById("workerSelect");

    select.innerHTML = "";

    const snapshot = await getDocs(workersRef);

    snapshot.forEach((workerDoc) => {

        const worker = workerDoc.data();

        if (worker.status === "Available") {

            select.innerHTML += `

            <option value="${workerDoc.id}">

                ${worker.name}

            </option>

            `;

        }

    });

}
document.getElementById("assignWorkerBtn")
?.addEventListener("click", async () => {

    const workerId =
    document.getElementById("workerSelect").value;

    const workerDoc =
    await getDoc(doc(db, "workers", workerId));

    const worker = workerDoc.data();

    await updateDoc(

        doc(db, "bookings", assignBookingId),

        {

            status: "Worker Assigned",

            assignedWorkerId: workerId,

            assignedWorkerName: worker.name,

            assignedOn: new Date().toLocaleString()

        }

    );

    await updateDoc(

        doc(db, "workers", workerId),

        {

            status: "Busy"

        }

    );

    assignWorkerModal.classList.remove("show");

    alert("Worker Assigned Successfully.");

    loadBookings();

});
document.addEventListener("click", async (e) => {

    const btn = e.target.closest(".start-btn");

    if (!btn) return;

    await updateDoc(

        doc(db, "bookings", btn.dataset.id),

        {

            status: "In Progress",

            workStartedOn:
            new Date().toLocaleString()

        }

    );

    alert("Work Started.");

    loadBookings();

});


document.addEventListener("click", async (e) => {

    const btn = e.target.closest(".complete-btn");

    if (!btn) return;

    if (!confirm("Mark this booking as Completed?")) return;

    await updateDoc(
        doc(db, "bookings", btn.dataset.id),
        {
            status: "Completed",
            completedOn: new Date().toLocaleString()
        }
    );

    const booking = bookingList.find(
        b => b.id === btn.dataset.id
    );

    if (booking) {

        const feedbackLink =
       
       
`https://docs.google.com/forms/d/e/1FAIpQLSc71-9rlkbno2H0IurfxbL6nH0_zCrH6_0WISFh_PnxoJ9KSg/viewform?usp=pp_url&entry.1188985959=${encodeURIComponent(booking.customerName)}&entry.1983899620=${encodeURIComponent(booking.bookingId)}&entry.392292592=${encodeURIComponent(booking.services.join(", "))}`;

        const message = `🏠 *FIXOSERV*

Dear ${booking.customerName},

✅ Your *${booking.services.join(", ")}* service has been completed successfully.

━━━━━━━━━━━━━━

📌 Service ID : ${booking.bookingId}

📅 Service Date : ${booking.preferredDate}

━━━━━━━━━━━━━━

Thank you for choosing *FixoServ*.

⭐ We would love to hear your feedback.

Please rate our service:

${feedbackLink}

Thank you!
*Team FixoServ* 😊`;

        sendWhatsApp(booking.phone, message);

    }

    alert("Booking Completed Successfully.");

    loadBookings();

});
// ======================================
// SEND WHATSAPP
// ======================================



function sendWhatsApp(phone, message) {

    if (!phone) {
        alert("Customer phone number not found.");
        return;
    }

    let number = phone.replace(/\D/g, "");

    if (number.length === 10) {
        number = "91" + number;
    }

    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
}


// ======================================
// SEARCH BOOKINGS
// ======================================

document.getElementById("searchBooking")
.addEventListener("keyup",function(){

    const value=this.value.toLowerCase();

    const filtered=bookingList.filter(booking=>{

        return(

            booking.bookingId?.toLowerCase().includes(value)||

            booking.customerName?.toLowerCase().includes(value)||

            booking.phone?.includes(value)||

            booking.services?.join(", ").toLowerCase().includes(value)||

            booking.status?.toLowerCase().includes(value)

        );

    });

   currentPage = 1;

displayBookings(filtered);

});



// ======================================
// FILTER BUTTONS
// ======================================

document.getElementById("allBtn").addEventListener("click", function () {

    setActive(this);

    currentPage = 1;

    displayBookings(bookingList);

});



document.getElementById("pendingBtn").addEventListener("click", function () {

    setActive(this);

    currentPage = 1;

    displayBookings(
        bookingList.filter(b => b.status === "Pending")
    );

});



document.getElementById("completedBtn").addEventListener("click", function () {

    setActive(this);

    currentPage = 1;

    displayBookings(
        bookingList.filter(b => b.status === "Completed")
    );

});



document.getElementById("cancelledBtn").addEventListener("click", function () {

    setActive(this);

    currentPage = 1;

    displayBookings(
        bookingList.filter(b => b.status === "Cancelled")
    );

});



document.getElementById("todayBtn").addEventListener("click", function () {

    console.log(bookingList);

    setActive(this);

    currentPage = 1;

    const now = new Date();

    const today =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0");

    

const todayBookings = bookingList.filter(booking => {

    if (!booking.createdAt) return false;

    const bookingDate =
        booking.createdAt.toDate();

    return (

        bookingDate.getFullYear() === now.getFullYear() &&

        bookingDate.getMonth() === now.getMonth() &&

        bookingDate.getDate() === now.getDate()

    );

});

    console.log("Today's Date :", today);

    console.log("Bookings :", bookingList);

    console.log("Today Bookings :", todayBookings);

    displayBookings(todayBookings);

});

const filterButtons = document.querySelectorAll(".filters button");

function setActive(btn) {

    filterButtons.forEach(button => {
        button.classList.remove("active");
    });

    btn.classList.add("active");

}

onSnapshot(settingsRef,(snap)=>{

    if(!snap.exists()) return;

    const data=snap.data();

    const adminName=document.getElementById("adminDisplayName");

    if(adminName){

        adminName.textContent=data.adminName || "Admin";

    }

    if(data.theme==="dark"){

        document.body.classList.add("dark");

    }else{

        document.body.classList.remove("dark");

    }

});