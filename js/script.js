import { auth } from "../firebase/firebase-config.js";

import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {

    db

} from "../firebase/firebase-config.js";

import {

    doc,

    getDoc,

    updateDoc

} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

/* ==========================================
MENU
========================================== */

const guestMenu = document.getElementById("guestMenu");

const userMenu = document.getElementById("userMenu");

const menuBtn = document.getElementById("menuBtn");

const menuDropdown = document.getElementById("menuDropdown");

/* ==========================================
PROFILE
========================================== */

const profileBtn =
document.getElementById("profileBtn");

const mobileProfileBtn =
document.getElementById("mobileProfileBtn");

const profileModal =
document.getElementById("profileModal");

const closeProfile =
document.getElementById("closeProfile");

const passwordModal =
document.getElementById("passwordModal");

const changePasswordBtn =
document.getElementById("changePasswordBtn");

const mobilePasswordBtn =
document.getElementById("mobilePasswordBtn");

const closePassword =
document.getElementById("closePassword");

const closePasswordBtn =
document.getElementById("closePasswordBtn");

const updatePasswordBtn =
document.getElementById("updatePasswordBtn");

const forgotPasswordLink =
document.getElementById("forgotPasswordLink");

const closeProfileBtn =
document.getElementById("closeProfileBtn");

const saveProfileBtn =
document.getElementById("saveProfileBtn");

/* ==========================================
LOGIN CHECK
========================================== */

onAuthStateChanged(auth, async (user) => {

    const mobileGuestMenu = document.getElementById("mobileGuestMenu");
    const mobileUserMenu = document.getElementById("mobileUserMenu");

    if (user) {

        guestMenu.style.display = "none";
        userMenu.style.display = "block";

        if (window.innerWidth <= 768) {
            if (mobileGuestMenu) mobileGuestMenu.style.display = "none";
            if (mobileUserMenu) mobileUserMenu.style.display = "block";
        }

        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {

            const data = snap.data();

            profileName.value = data.name || data.fullName || "";
            profileEmail.value = data.email || "";
            profilePhone.value = data.phone || "";

        }

    } else {

        guestMenu.style.display = "flex";
        userMenu.style.display = "none";

        if (window.innerWidth <= 768) {
            if (mobileGuestMenu) mobileGuestMenu.style.display = "block";
            if (mobileUserMenu) mobileUserMenu.style.display = "none";
        }

    }

});

/* ==========================================
MENU
========================================== */

menuBtn.addEventListener("click", (e) => {

    e.preventDefault();
    e.stopPropagation();

    const mobileNav = document.getElementById("mobileNav");

    if (window.innerWidth <= 768) {

        if (mobileNav) {
            mobileNav.classList.toggle("show");
        }

        menuDropdown.style.display = "none";

    } else {

        menuDropdown.style.display =
            menuDropdown.style.display === "block"
                ? "none"
                : "block";

        if (mobileNav) {
            mobileNav.classList.remove("show");
        }

    }

});

/* ==========================================
PROFILE
========================================== */

profileBtn.addEventListener("click",(e)=>{

    e.preventDefault();

    menuDropdown.style.display="none";

    profileModal.style.display="flex";

});


if (mobileProfileBtn) {

    mobileProfileBtn.addEventListener("click", (e) => {

        e.preventDefault();

        document.getElementById("mobileNav").classList.remove("show");

        profileModal.style.display = "flex";

    });

}
/* ==========================================
CHANGE PASSWORD POPUP
========================================== */

changePasswordBtn.addEventListener("click",(e)=>{

    e.preventDefault();

    menuDropdown.style.display="none";

    passwordModal.style.display="flex";

});


if (mobilePasswordBtn) {

    mobilePasswordBtn.addEventListener("click", (e) => {

        e.preventDefault();

        document.getElementById("mobileNav").classList.remove("show");

        passwordModal.style.display = "flex";

    });

}

closePassword.addEventListener("click",()=>{

    passwordModal.style.display="none";

});

closePasswordBtn.addEventListener("click",()=>{

    passwordModal.style.display="none";

});

closeProfile.addEventListener("click",()=>{

    profileModal.style.display="none";

});

closeProfileBtn.addEventListener("click",()=>{

    profileModal.style.display="none";

});

window.addEventListener("click", (e) => {

    const mobileNav = document.getElementById("mobileNav");

    if (e.target === profileModal) {
        profileModal.style.display = "none";
    }

    if (e.target === passwordModal) {
        passwordModal.style.display = "none";
    }

    if (
        !menuBtn.contains(e.target) &&
        !menuDropdown.contains(e.target)
    ) {
        menuDropdown.style.display = "none";
    }

    if (
        mobileNav &&
        !mobileNav.contains(e.target) &&
        !menuBtn.contains(e.target)
    ) {
        mobileNav.classList.remove("show");
    }

});

/* ==========================================
SAVE PROFILE
========================================== */

saveProfileBtn.addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) return;

    try {

        await updateDoc(

            doc(db, "users", user.uid),

            {

                name: document.getElementById("profileName").value,

                phone: document.getElementById("profilePhone").value

            }

        );

        showToast("Profile Updated Successfully.");

        profileModal.style.display = "none";

    }

    catch (error) {

        console.error(error);

        showToast("Unable to update profile.", "error");

    }

});

/* ==========================================
CHANGE PASSWORD
========================================== */

import {

    EmailAuthProvider,

    reauthenticateWithCredential,

    updatePassword,

    sendPasswordResetEmail,

    signOut

} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

updatePasswordBtn.addEventListener("click", async()=>{

    const currentPassword =
    document.getElementById("currentPassword").value;

    const newPassword =
    document.getElementById("newPassword").value;

    const confirmPassword =
    document.getElementById("confirmNewPassword").value;

    if(newPassword!==confirmPassword){

        showToast("Passwords do not match.");

        return;

    }

    try{

        const user = auth.currentUser;

        const credential = EmailAuthProvider.credential(

            user.email,

            currentPassword

        );

        await reauthenticateWithCredential(

            user,

            credential

        );

        await updatePassword(

            user,

            newPassword

        );

        showToast("Password Updated Successfully.");

        passwordModal.style.display="none";

    }

    catch(error){

        showToast(error.message);

    }

});

/* ==========================================
FORGOT PASSWORD
========================================== */

forgotPasswordLink.addEventListener("click",async(e)=>{

    e.preventDefault();

    const user = auth.currentUser;

    await sendPasswordResetEmail(

        auth,

        user.email

    );

    showToast("Password reset email sent.");

});

/* ==========================================
SHOW / HIDE PASSWORDS
========================================== */

function togglePassword(inputId, iconId){

    const input = document.getElementById(inputId);

    const icon = document.getElementById(iconId);

    icon.addEventListener("click",()=>{

        if(input.type==="password"){

            input.type="text";

            icon.classList.remove("fa-eye");

            icon.classList.add("fa-eye-slash");

        }

        else{

            input.type="password";

            icon.classList.remove("fa-eye-slash");

            icon.classList.add("fa-eye");

        }

    });

}

togglePassword(
    "currentPassword",
    "toggleCurrentPassword"
);

togglePassword(
    "newPassword",
    "toggleNewPassword"
);

togglePassword(
    "confirmNewPassword",
    "toggleConfirmPassword"
);

/* ==========================================
LOGOUT
========================================== */

const logoutBtn =
document.getElementById("logoutBtn");

const mobileLogoutBtn =
document.getElementById("mobileLogoutBtn");

logoutBtn.addEventListener("click", async(e)=>{

    e.preventDefault();

    const result = confirm(

        "Are you sure you want to logout?"

    );

    if(!result) return;

    try{

        await signOut(auth);

        window.location.href="login.html";

    }

    catch(error){

        console.error(error);

        showToast("Logout Failed.");

    }

});

if (mobileLogoutBtn) {

    mobileLogoutBtn.addEventListener("click", async (e) => {

        e.preventDefault();

        const result = confirm("Are you sure you want to logout?");

        if (!result) return;

        try {

            await signOut(auth);

            window.location.href = "login.html";

        } catch (error) {

            showToast("Logout Failed.");

        }

    });

}


/* ==========================================
TOAST NOTIFICATION
========================================== */

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.className = "";

    toast.classList.add(type);

    if (type === "success") {
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    } else {
        toast.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ${message}`;
    }

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);

}