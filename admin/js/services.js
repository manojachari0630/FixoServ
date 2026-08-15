import { db } from "../../firebase/firebase-config.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
   onSnapshot
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ===============================
// SIDEBAR TOGGLE
// ===============================

const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.querySelector(".toggle");

toggleBtn?.addEventListener("click", () => {

    sidebar?.classList.toggle("collapsed");

});


// ===============================
// FIRESTORE COLLECTION
// ===============================

const servicesRef = collection(db, "services");

const settingsRef = doc(db, "settings", "admin");
// ===============================
// SEARCH SERVICES
// ===============================

const searchInput = document.querySelector(".search input");

searchInput?.addEventListener("keyup", () => {

    const value = searchInput.value.toLowerCase();

    document.querySelectorAll("#servicesTableBody tr").forEach(row => {

        row.style.display =
            row.innerText.toLowerCase().includes(value)
            ? ""
            : "none";

    });

});

// ===============================
// MODAL ELEMENTS
// ===============================

const addBtn = document.querySelector(".add-btn");

const modal = document.getElementById("addServiceModal");

const closeBtn = document.getElementById("closeModal");

const cancelBtn = document.getElementById("cancelBtn");

const saveBtn = document.getElementById("saveServiceBtn");

const serviceName = document.getElementById("serviceName");

const serviceDescription =
document.getElementById("serviceDescription");

const serviceImage =
document.getElementById("serviceImage");

const tableBody =
document.getElementById("servicesTableBody");

console.log("Part 1 Loaded");
// ===============================
// OPEN MODAL
// ===============================

addBtn?.addEventListener("click", () => {

    modal.style.display = "flex";

    serviceName.value = "";
    serviceDescription.value = "";
    serviceImage.selectedIndex = 0;

});

// ===============================
// CLOSE MODAL
// ===============================

closeBtn?.addEventListener("click", () => {

    modal.style.display = "none";

});

cancelBtn?.addEventListener("click", () => {

    modal.style.display = "none";

});

window.addEventListener("click", (e) => {

    if (e.target === modal) {

        modal.style.display = "none";

    }

});

// ===============================
// TOAST MESSAGE
// ===============================

function showToast(message) {

    const toast = document.createElement("div");

    toast.innerText = message;

    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.background = "#2563eb";
    toast.style.color = "#fff";
    toast.style.padding = "12px 18px";
    toast.style.borderRadius = "8px";
    toast.style.boxShadow = "0 8px 20px rgba(0,0,0,.2)";
    toast.style.zIndex = "9999";

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 2500);

}

console.log("Part 2 Loaded");
// ===============================
// LOAD SERVICES
// ===============================

async function loadServices() {

    tableBody.innerHTML = "";

    const snapshot = await getDocs(servicesRef);

    snapshot.forEach((docSnap) => {

        const service = docSnap.data();

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <img src="${service.image}" class="service-img">
            </td>

            <td>${service.name}</td>

            <td>${service.description}</td>

            <td>
                <button class="edit-btn" data-id="${docSnap.id}">
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button class="delete-btn" data-id="${docSnap.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(row);

    });

}

loadServices();

// ===============================
// SAVE SERVICE
// ===============================

saveBtn.addEventListener("click", async () => {

    if (
        serviceName.value.trim() === "" ||
        serviceDescription.value.trim() === ""
    ) {
        alert("Please fill all fields.");
        return;
    }

    console.log("Selected Image:", serviceImage.value);

await addDoc(servicesRef, {

    name: serviceName.value,

    description: serviceDescription.value,

    image: serviceImage.value

});

    modal.style.display = "none";

    showToast("Service Added Successfully");

    loadServices();

});

console.log("Part 3 Loaded");
// ===============================
// DELETE & EDIT
// ===============================

tableBody.addEventListener("click", async (e) => {

    // DELETE
    if (e.target.closest(".delete-btn")) {

        const id = e.target.closest(".delete-btn").dataset.id;

        if (confirm("Delete this service?")) {

            await deleteDoc(doc(db, "services", id));

            showToast("Service Deleted");

            loadServices();
        }
    }

    // EDIT
    if (e.target.closest(".edit-btn")) {

        const id = e.target.closest(".edit-btn").dataset.id;

        const newName = prompt("Enter new Service Name");

        if (!newName) return;

        const newDescription = prompt("Enter new Description");

        if (!newDescription) return;

        await updateDoc(doc(db, "services", id), {

            name: newName,
            description: newDescription

        });

        showToast("Service Updated");

        loadServices();
    }

});

console.log("Services Management Loaded Successfully");

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

