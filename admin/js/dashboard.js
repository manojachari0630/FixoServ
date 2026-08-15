let bookingChart;


import { db } from "../../firebase/firebase-config.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";




// ==========================
// Active Menu
// ==========================

const menuItems = document.querySelectorAll(".sidebar ul li");

menuItems.forEach(item => {

    item.addEventListener("click", () => {

        menuItems.forEach(i => i.classList.remove("active"));

        item.classList.add("active");

    });

});

// ==========================
// Counter Animation
// ==========================

const counters = document.querySelectorAll(".card h2");

counters.forEach(counter => {

    const target = Number(counter.innerText);

    let count = 0;

    const speed = Math.max(1, target / 40);

    function update() {

        if (count < target) {

            count += speed;

            counter.innerText = Math.floor(count);

            requestAnimationFrame(update);

        } else {

            counter.innerText = target;

        }

    }

    update();

});

// ==========================
// Search
// ==========================

const search = document.querySelector(".search input");

search.addEventListener("keyup", () => {

    const value = search.value.toLowerCase();

    document.querySelectorAll("#recentBookings tr").forEach(row => {

        const text = row.innerText.toLowerCase();

        row.style.display = text.includes(value) ? "" : "none";

    });

});

// ==========================
// Notification
// ==========================



// ==========================
// Welcome Button
// ==========================

const addBtn = document.querySelector(".welcome button");

if(addBtn){

    addBtn.addEventListener("click", () => {

        window.location.href = "../pages/services.html";

    });

}



// ==========================
// Fade Animation
// ==========================

window.addEventListener("load",()=>{

    document.querySelectorAll(".card,.bookings,.summary,.quick-actions,.activity")
    .forEach((card,index)=>{

        card.style.opacity="0";
        card.style.transform="translateY(20px)";

        setTimeout(()=>{

            card.style.transition=".5s";
            card.style.opacity="1";
            card.style.transform="translateY(0)";

        },index*120);

    });

});

console.log("FixoServ Dashboard Loaded");

function loadDashboardCounts() {

    const bookingsQuery = query(
    collection(db, "bookings"),
    orderBy("createdAt", "desc")
);

onSnapshot(bookingsQuery, (snapshot) => {

        let totalBookings=0;
        let pending=0;
        let accepted=0;
        let progress=0;
        let completed=0;
        let cancelled=0;

        const customers={};

        snapshot.forEach((doc)=>{

            const data=doc.data();

            totalBookings++;

            customers[data.phone]=true;

            switch(data.status){

                case "Pending":
                    pending++;
                    break;

                case "Accepted":
                    accepted++;
                    break;

                case "In Progress":
                    progress++;
                    break;

                case "Completed":
                    completed++;
                    break;

                case "Cancelled":
                    cancelled++;
                    break;

            }

        });

        document.getElementById("totalBookings").textContent=totalBookings;

        document.getElementById("pendingBookings").textContent=pending;

        document.getElementById("completedBookings").textContent=completed;

        document.getElementById("totalCustomers").textContent=Object.keys(customers).length;


        drawChart(

    pending,

    accepted,

    progress,

    completed,

    cancelled

);

loadRecentBookings(snapshot);

    });

}

loadDashboardCounts();


function drawChart(
    pending,
    accepted,
    progress,
    completed,
    cancelled
){

    const ctx=document
    .getElementById("bookingChart");

    if(bookingChart){

        bookingChart.destroy();

    }

    bookingChart=new Chart(ctx,{

        type:"doughnut",

        data:{

            labels:[
                "Pending",
                "Accepted",
                "In Progress",
                "Completed",
                "Cancelled"
            ],

            datasets:[{

                data:[
                    pending,
                    accepted,
                    progress,
                    completed,
                    cancelled
                ],

                backgroundColor:[

                    "#f59e0b",
                    "#3b82f6",
                    "#8b5cf6",
                    "#22c55e",
                    "#ef4444"

                ]

            }]

        },

      options: {

    responsive: true,

    plugins: {
        title:{

    display:true,

    text:"Live Booking Status"

},

        legend: {

            position: "right",

            labels: {

                generateLabels(chart) {

                    const data = chart.data.datasets[0].data;
                    const labels = chart.data.labels;

                    const total = data.reduce((a, b) => a + b, 0);

                    return labels.map((label, i) => {

                        const value = data[i];

                        const percentage = total
                            ? ((value / total) * 100).toFixed(1)
                            : 0;

                        return {

                            text: `${label}: ${value} (${percentage}%)`,

                            fillStyle:
                                chart.data.datasets[0].backgroundColor[i],

                            strokeStyle:
                                chart.data.datasets[0].backgroundColor[i],

                            hidden: false,

                            index: i

                        };

                    });

                }

            }

        }

        

    }

}

    });

}


function loadRecentBookings(snapshot){

    const tbody=document.getElementById("recentBookings");

    tbody.innerHTML="";

    let count=0;

    snapshot.forEach(doc=>{

        if(count>=5) return;

        const data=doc.data();

        tbody.innerHTML+=`

        <tr>

            <td>${data.bookingId}</td>

            <td>${data.customerName}</td>

            <td>${data.services.join(", ")}</td>

            <td>${data.status}</td>

        </tr>

        `;

        count++;

    });

}


/* ==========================
   NOTIFICATIONS
========================== */

/* ==========================
   NOTIFICATIONS
   ========================== */

const notificationBell =
    document.getElementById("notificationBell");

const notificationDot =
    document.getElementById("notificationDot");

const notificationPanel =
    document.getElementById("notificationPanel");

const notificationList =
    document.getElementById("notificationList");

const notificationsRef = query(
    collection(db, "notifications"),
    orderBy("createdAt", "desc")
);


// Store the currently loaded notifications
let currentNotifications = [];


// ==========================
// Load Notifications
// ==========================

onSnapshot(notificationsRef, async (snapshot) => {

    notificationList.innerHTML = "";

    let unread = false;

    const now = Date.now();

    currentNotifications = [];


    for (const docSnap of snapshot.docs) {

        const data = docSnap.data();

        // Firebase Timestamp
        let createdTime = null;

        if (data.createdAt && data.createdAt.toMillis) {

            createdTime = data.createdAt.toMillis();

        }


        // ==========================
        // Delete notifications older
        // than 24 hours
        // ==========================

        if (
            createdTime &&
            (now - createdTime) >= 24 * 60 * 60 * 1000
        ) {

            await deleteDoc(
                doc(db, "notifications", docSnap.id)
            );

            continue;

        }


        // Keep only active notifications
        currentNotifications.push({
            id: docSnap.id,
            data: data
        });


        if (!data.read) {

            unread = true;

        }


        // ==========================
        // Display notification
        // ==========================

        notificationList.innerHTML += `

            <div class="notification-item">

                <strong>
                    ${
                        data.type === "booking"
                        ? "🆕 New Booking"
                        : "❌ Booking Cancelled"
                    }
                </strong>

                <p>
                    ${data.message}
                </p>

            </div>

        `;

    }


    // ==========================
    // No notifications
    // ==========================

    if (currentNotifications.length === 0) {

        notificationList.innerHTML = `

            <p class="empty-notification">
                No Notifications
            </p>

        `;

        notificationDot.style.display = "none";

    } else {

        notificationDot.style.display =
            unread ? "block" : "none";

    }

});


// ==========================
// Notification Bell
// ==========================

if (notificationBell) {

    notificationBell.addEventListener("click", async () => {

        notificationPanel.classList.toggle("show");


        // Mark currently displayed
        // notifications as read

        for (const item of currentNotifications) {

            if (!item.data.read) {

                await updateDoc(

                    doc(
                        db,
                        "notifications",
                        item.id
                    ),

                    {
                        read: true
                    }

                );

            }

        }


        // Remove red notification dot
        notificationDot.style.display = "none";

    });

}
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

if(menuToggle){

    menuToggle.addEventListener("click",()=>{

        sidebar.classList.toggle("show");

    });

}
