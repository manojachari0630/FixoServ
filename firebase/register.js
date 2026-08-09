console.log("Register JS Loaded");
import { auth, db } from "./firebase-config.js";

import {

    createUserWithEmailAndPassword

} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {

    doc,

    setDoc,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ==========================================
   REGISTER USER
========================================== */

export async function createNewUser(

    fullName,

    email,

    phone,

    password

){

    try{

        const userCredential =

        await createUserWithEmailAndPassword(

            auth,

            email,

            password

        );

        const user = userCredential.user;

        await setDoc(

            doc(db,"users",user.uid),

            {

                uid:user.uid,

                fullName:fullName,

                email:email,

                phone:phone,

                role:"user",

                createdAt:serverTimestamp()

            }

        );

        return{

            success:true

        };

    }

    catch(error){

        return{

            success:false,

            message:error.message

        };

    }

}