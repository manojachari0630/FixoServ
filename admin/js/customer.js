import { db } from "../../firebase/firebase-config.js";

import {
     collection,
    onSnapshot,
    query,
    where,
    orderBy,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// ========================================
// FIREBASE
// ========================================

const bookingsRef = collection(db, "bookings");

const bookingsQuery = query(
    bookingsRef,
    orderBy("createdAt", "desc")
);




const settingsRef = doc(db, "settings", "admin");

// ========================================
// SIDEBAR TOGGLE
// ========================================

const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.querySelector(".toggle");

toggleBtn?.addEventListener("click", () => {
    sidebar?.classList.toggle("collapsed");
});


// ========================================
// HTML ELEMENTS
// ========================================

const tableBody = document.getElementById("customerTableBody");

const totalCustomers = document.getElementById("totalCustomers");
const activeCustomers = document.getElementById("activeCustomers");
const inactiveCustomers = document.getElementById("inactiveCustomers");
const premiumCustomers = document.getElementById("premiumCustomers");

const searchInput = document.getElementById("searchCustomer");


// ========================================
// GLOBAL VARIABLES
// ========================================

let customerList = [];

let currentFilter = "All";

let currentPage = 1;

const rowsPerPage = 10;

// ========================================
// FILTERED DATA
// ========================================

let filteredCustomers = [];


// ========================================
// LOAD CUSTOMERS (LIVE)
// ========================================

function updateDashboard() {

    let total = customerList.length;
    let active = 0;
    let inactive = 0;
    let premium = 0;

    customerList.forEach(customer => {

        if (customer.status === "Premium") {

            premium++;

        }
        else if (customer.status === "Inactive") {

            inactive++;

        }
        else {

            active++;

        }

    });

    totalCustomers.textContent = total;
    activeCustomers.textContent = active;
    inactiveCustomers.textContent = inactive;
    premiumCustomers.textContent = premium;

}

onSnapshot(bookingsQuery,(snapshot)=>{

    customerList=[];

    const customerMap={};

    snapshot.forEach(doc=>{

        const booking=doc.data();

        const phone=booking.phone;

        if(!customerMap[phone]){

            customerMap[phone]={

                id:doc.id,

                customerName:booking.customerName,

                phone:booking.phone,

                email:booking.email,

                bookings:1,

                latestBooking:booking,

                status:"Active"

            };

        }

        else{

            customerMap[phone].bookings++;

            customerMap[phone].latestBooking=booking;

        }

    });

    customerList=Object.values(customerMap);

    customerList.forEach(customer=>{

        if(customer.bookings>=5){

            customer.status="Premium";

        }

    });

    updateDashboard();

   filteredCustomers = [...customerList];

renderCustomers(filteredCustomers);

});


// ========================================
// RENDER CUSTOMERS
// ========================================

function renderCustomers(list){

    tableBody.innerHTML="";

    const start=(currentPage-1)*rowsPerPage;

    const end=start+rowsPerPage;

    const pageData=list.slice(start,end);

    if(pageData.length===0){

        tableBody.innerHTML=`

<tr>

<td colspan="7"

style="text-align:center;padding:40px;">

No Customers Found

</td>

</tr>

`;

        updatePagination(list.length);

        return;

    }

    pageData.forEach(customer=>{

        let badge="active-status";

        if(customer.status==="Premium"){

            badge="premium-status";

        }

        else if(customer.status==="Inactive"){

            badge="inactive-status";

        }

        tableBody.innerHTML+=`

<tr>

<td>

<img

class="avatar"

src="https://ui-avatars.com/api/?name=${encodeURIComponent(customer.customerName)}&background=2563eb&color=fff">

</td>

<td>${customer.customerName}</td>

<td>${customer.phone}</td>

<td>${customer.email}</td>

<td>${customer.bookings}</td>

<td>

<span class="${badge}">

${customer.status}

</span>

</td>

<td>

<button class="view-btn"
onclick="viewCustomer('${customer.phone}')">

<i class="fa-solid fa-eye"></i>

</button>

<button class="edit-btn"
onclick="editCustomer('${customer.phone}')">

<i class="fa-solid fa-pen"></i>

</button>

<button class="call-btn"
onclick="callCustomer('${customer.phone}')">

<i class="fa-solid fa-phone"></i>

</button>

<button class="message-btn"
onclick="whatsappCustomer('${customer.phone}')">

<i class="fa-brands fa-whatsapp"></i>

</button>

<button class="delete-btn"
onclick="deleteCustomer('${customer.phone}')">

<i class="fa-solid fa-trash"></i>

</button>

</td>

</tr>

`;

    });

    updatePagination(list.length);

}


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener("keyup",()=>{

    const value=searchInput.value.toLowerCase();

    filteredCustomers=customerList.filter(customer=>{

        return(

            customer.customerName.toLowerCase().includes(value)||

            customer.phone.includes(value)||

            customer.email.toLowerCase().includes(value)

        );

    });

    currentPage=1;

    renderCustomers(filteredCustomers);

});


// ========================================
// FILTERS
// ========================================

const filterButtons=document.querySelectorAll(".filters button");

function setActive(btn){

    filterButtons.forEach(button=>{

        button.classList.remove("active");

    });

    btn.classList.add("active");

}


document.getElementById("allBtn").onclick=function(){

    setActive(this);

    filteredCustomers=[...customerList];

    currentPage=1;

    renderCustomers(filteredCustomers);

};

document.getElementById("activeBtn").onclick=function(){

    setActive(this);

    filteredCustomers=customerList.filter(c=>c.status==="Active");

    currentPage=1;

    renderCustomers(filteredCustomers);

};

document.getElementById("premiumBtn").onclick=function(){

    setActive(this);

    filteredCustomers=customerList.filter(c=>c.status==="Premium");

    currentPage=1;

    renderCustomers(filteredCustomers);

};

document.getElementById("inactiveBtn").onclick=function(){

    setActive(this);

    filteredCustomers=customerList.filter(c=>c.status==="Inactive");

    currentPage=1;

    renderCustomers(filteredCustomers);

};


// ========================================
// PAGINATION
// ========================================

function updatePagination(totalRows){

    const pagination=document.getElementById("pagination");

    pagination.innerHTML="";

    const pages=Math.ceil(totalRows/rowsPerPage);

    for(let i=1;i<=pages;i++){

        pagination.innerHTML+=`

<button

class="${i===currentPage?"active":""}"

onclick="changePage(${i})">

${i}

</button>

`;

    }

}

window.changePage=function(page){

    currentPage=page;

    renderCustomers(filteredCustomers);

}


// ========================================
// VIEW CUSTOMER
// ========================================

window.viewCustomer = async function(phone){

    const snapshot = await getDocs(bookingsRef);

    let customer = null;

    let totalBookings = 0;

    let completed = 0;

    let pending = 0;

    let cancelled = 0;

    let bookingHistory = "";

    snapshot.forEach(doc=>{

        const booking = doc.data();

        if(booking.phone !== phone) return;

        totalBookings++;

        customer = booking;

        if(booking.status==="Completed"){

            completed++;

        }

        else if(booking.status==="Pending"){

            pending++;

        }

        else if(booking.status==="Cancelled"){

            cancelled++;

        }

        bookingHistory += `

<div class="history-card">

<h4>${booking.bookingId}</h4>

<p>

<b>Service:</b>

${booking.services.join(", ")}

</p>

<p>

<b>Date:</b>

${booking.preferredDate}

</p>

<p>

<b>Time:</b>

${booking.preferredTime}

</p>

<p>

<b>Status:</b>

<span class="${booking.status.toLowerCase()}">

${booking.status}

</span>

</p>

</div>

`;

    });

    if(!customer){

        alert("Customer not found");

        return;

    }

    document.getElementById("modalAvatar").src=

`https://ui-avatars.com/api/?name=${encodeURIComponent(customer.customerName)}&background=2563eb&color=ffffff`;

    document.getElementById("modalName").textContent=

customer.customerName;

    document.getElementById("modalPhone").textContent=

customer.phone;

    document.getElementById("modalEmail").textContent=

customer.email;

    document.getElementById("modalAddress").textContent=

`${customer.house},
${customer.street},
${customer.city}
- ${customer.pincode}`;

    document.getElementById("modalBookings").textContent=

totalBookings;

    document.getElementById("modalService").textContent=

customer.services.join(", ");

    document.getElementById("modalBookingStatus").textContent=

customer.status;

    document.getElementById("modalDate").textContent=

customer.preferredDate;

    document.getElementById("modalTime").textContent=

customer.preferredTime;

    document.getElementById("bookingHistory").innerHTML=

bookingHistory;

    let status="🟢 Active";

    if(totalBookings>=5){

        status="👑 Premium Customer";

    }

    document.getElementById("modalStatus").innerHTML=`

${status}

<br><br>

📦 Total Bookings : ${totalBookings}

<br>

✅ Completed : ${completed}

<br>

⏳ Pending : ${pending}

<br>

❌ Cancelled : ${cancelled}

`;

    document.getElementById("customerModal").style.display="flex";

}

document.querySelector(".close-modal").onclick=function(){

    document.getElementById("customerModal").style.display="none";

}

window.onclick=function(e){

    if(e.target===document.getElementById("customerModal")){

        document.getElementById("customerModal").style.display="none";

    }

    if(e.target===document.getElementById("editCustomerModal")){

        document.getElementById("editCustomerModal").style.display="none";

    }

}

window.callCustomer = function(phone){

    window.location.href = `tel:${phone}`;

};

window.whatsappCustomer = async function(phone){

    const snapshot = await getDocs(bookingsRef);

    let customer = null;

    snapshot.forEach(doc=>{

        const booking = doc.data();

        if(booking.phone===phone && customer===null){

            customer=booking;

        }

    });

    if(!customer){

        alert("Customer not found.");

        return;

    }

    const message=`🏠 *FIXOSERV*

Hello ${customer.customerName},

Thank you for choosing FixoServ.

If you need any assistance regarding your booking, feel free to contact us.

We are always happy to help.

Team FixoServ 😊`;

    window.open(

`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`,

"_blank"

);

};


document.getElementById("updateCustomerBtn").onclick = async ()=>{

    const oldPhone=document.getElementById("oldPhone").value;

    const newName=document.getElementById("editName").value.trim();

    const newPhone=document.getElementById("editPhone").value.trim();

    const newEmail=document.getElementById("editEmail").value.trim();

    if(newName===""||newPhone===""){

        alert("Please fill all required fields.");

        return;

    }

    const q=query(

        bookingsRef,

        where("phone","==",oldPhone)

    );

    const snapshot=await getDocs(q);

    for(const booking of snapshot.docs){

        await updateDoc(booking.ref,{

            customerName:newName,

            phone:newPhone,

            email:newEmail

        });

    }

    alert("Customer updated successfully.");

    document.getElementById("editCustomerModal").style.display="none";

};


window.deleteCustomer = async function(phone){

    if(!confirm("Delete this customer?")){

        return;

    }

    const q=query(

        bookingsRef,

        where("phone","==",phone)

    );

    const snapshot=await getDocs(q);

    if(snapshot.empty){

        alert("Customer not found.");

        return;

    }

    if(!confirm("This will delete ALL bookings of this customer.\nContinue?")){

        return;

    }

    for(const booking of snapshot.docs){

        await deleteDoc(booking.ref);

    }

    alert("Customer deleted successfully.");

};

document.querySelector(".close-edit-modal").onclick=()=>{

document.getElementById("editCustomerModal").style.display="none";

}

window.editCustomer = async function(phone) {

    const q = query(
        bookingsRef,
        where("phone", "==", phone)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        alert("Customer not found.");
        return;
    }

    const customer = snapshot.docs[0].data();

    document.getElementById("oldPhone").value = customer.phone;
    document.getElementById("editName").value = customer.customerName;
    document.getElementById("editPhone").value = customer.phone;
    document.getElementById("editEmail").value = customer.email;

    document.getElementById("editCustomerModal").style.display = "flex";
};

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