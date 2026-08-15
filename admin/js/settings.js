import { db } from "../../firebase/firebase-config.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";



// ===============================
// SIDEBAR TOGGLE
// ===============================

const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.querySelector("#sidebarToggle");

toggleBtn?.addEventListener("click", () => {

    sidebar?.classList.toggle("collapsed");

});
/* ==========================================
   FIRESTORE
========================================== */

const settingsRef = doc(db, "settings", "admin");

/* ==========================================
   MODALS
========================================== */

const profileModal = document.getElementById("profileModal");
const themeModal = document.getElementById("themeModal");
const exportModal = document.getElementById("exportModal");
const aboutModal = document.getElementById("aboutModal");

/* ==========================================
   OPEN MODALS
========================================== */

document.getElementById("openProfile").onclick = () => {

    profileModal.style.display = "flex";

};

document.getElementById("openTheme").onclick = () => {

    themeModal.style.display = "flex";

};

document.getElementById("openExport").onclick = () => {

    exportModal.style.display = "flex";

};

document.getElementById("openAbout").onclick = () => {

    aboutModal.style.display = "flex";

};

/* ==========================================
   CLOSE MODALS
========================================== */

document.getElementById("closeProfile").onclick = () => {

    profileModal.style.display = "none";

};

document.getElementById("closeTheme").onclick = () => {

    themeModal.style.display = "none";

};

document.getElementById("closeExport").onclick = () => {

    exportModal.style.display = "none";

};

document.getElementById("closeAbout").onclick = () => {

    aboutModal.style.display = "none";

};

/* ==========================================
   CLICK OUTSIDE
========================================== */

window.onclick = (e)=>{

    if(e.target===profileModal){

        profileModal.style.display="none";

    }

    if(e.target===themeModal){

        themeModal.style.display="none";

    }

    if(e.target===exportModal){

        exportModal.style.display="none";

    }

    if(e.target===aboutModal){

        aboutModal.style.display="none";

    }

};

/* ==========================================
   LOAD SETTINGS
========================================== */

/* ==========================================
   LOAD SETTINGS
========================================== */

async function loadSettings(){

    const snap = await getDoc(settingsRef);

    if(!snap.exists()) return;

    const data = snap.data();

    document.getElementById("adminName").value =
        data.adminName || "";

    document.getElementById("adminEmail").value =
        data.adminEmail || "";

    document.getElementById("adminPhone").value =
        data.adminPhone || "";

    document.getElementById("adminDisplayName").textContent =
        data.adminName || "Admin";

    document.getElementById("themeMode").value =
        data.theme || "light";

    // Apply saved theme
    if(data.theme === "dark"){

        document.body.classList.add("dark");

    }else{

        document.body.classList.remove("dark");

    }

}

loadSettings();
/* ==========================================
   SAVE PROFILE
========================================== */

document.getElementById("saveProfile").addEventListener("click", async () => {

    try{

        await setDoc(settingsRef,{

            adminName:
                document.getElementById("adminName").value.trim(),

            adminEmail:
                document.getElementById("adminEmail").value.trim(),

            adminPhone:
                document.getElementById("adminPhone").value.trim(),

            theme:
                document.getElementById("themeMode").value

        },{ merge:true });

        document.getElementById("adminDisplayName").textContent =
            document.getElementById("adminName").value;

        alert("Profile Saved Successfully.");

        profileModal.style.display="none";

    }catch(error){

        console.error(error);

        alert("Failed to save profile.");

    }

});


/* ==========================================
   SAVE THEME
========================================== */

document.getElementById("saveTheme").addEventListener("click", async ()=>{

    const theme =
        document.getElementById("themeMode").value;

    try{

        await setDoc(settingsRef,{

            theme:theme

        },{ merge:true });

        if(theme==="dark"){

            document.body.classList.add("dark");

        }else{

            document.body.classList.remove("dark");

        }

        alert("Theme Updated Successfully.");

        themeModal.style.display="none";

    }catch(error){

        console.error(error);

        alert("Unable to save theme.");

    }

});



/* ==========================================
   DOWNLOAD CSV FUNCTION
========================================== */

function downloadCSV(filename, rows){

    const csv = rows
        .map(row => row.map(value => `"${value}"`).join(","))
        .join("\n");

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}

/* ==========================================
   EXPORT BOOKINGS
========================================== */

document.getElementById("downloadBookings").addEventListener("click", async()=>{

    const snapshot = await getDocs(collection(db,"bookings"));

    const rows = [[
        "Booking ID",
        "Customer",
        "Phone",
        "Email",
        "Services",
        "Date",
        "Time",
        "Status"
    ]];

    snapshot.forEach(doc=>{

        const data = doc.data();

        rows.push([

            data.bookingId || "",

            data.customerName || "",

            data.phone || "",

            data.email || "",

            (data.services || []).join(", "),

            data.preferredDate || "",

            data.preferredTime || "",

            data.status || ""

        ]);

    });

    downloadCSV("FixoServ_Bookings.csv", rows);

});


/* ==========================================
   EXPORT CUSTOMERS
========================================== */

document.getElementById("downloadCustomers").addEventListener("click", async()=>{

    const snapshot = await getDocs(collection(db,"bookings"));

    const customers = {};

    snapshot.forEach(doc=>{

        const data = doc.data();

        if(!customers[data.phone]){

            customers[data.phone]={

                name:data.customerName,

                phone:data.phone,

                email:data.email,

                bookings:1

            };

        }else{

            customers[data.phone].bookings++;

        }

    });

    const rows=[[
        "Customer",
        "Phone",
        "Email",
        "Bookings"
    ]];

    Object.values(customers).forEach(customer=>{

        rows.push([

            customer.name,

            customer.phone,

            customer.email,

            customer.bookings

        ]);

    });

    downloadCSV("FixoServ_Customers.csv", rows);

});


/* ==========================================
   LOGOUT
========================================== */

document.getElementById("logoutBtn").addEventListener("click",()=>{

    if(confirm("Are you sure you want to logout?")){

       window.location.href = "../../login.html";

    }

});


console.log("FixoServ Settings Loaded Successfully");
