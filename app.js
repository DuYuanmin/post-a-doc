import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your specific Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlsafUS59DD_JCON_gOcnE_EW5w1se_7Q",
  authDomain: "share-a-doc.firebaseapp.com",
  projectId: "share-a-doc",
  storageBucket: "share-a-doc.firebasestorage.app",
  messagingSenderId: "963631712842",
  appId: "1:963631712842:web:4b36adce28779d7671b4b3",
  measurementId: "G-DBP931QFWV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const editorSection = document.getElementById('editor-section');
const userDisplay = document.getElementById('userDisplay');
const postBtn = document.getElementById('postBtn');
const docInput = document.getElementById('docInput');
const docContainer = document.getElementById('docContainer');

// --- AUTHENTICATION ---
loginBtn.onclick = () => {
    signInWithPopup(auth, provider).catch(err => console.error("Login failed:", err));
};

logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        editorSection.style.display = 'block';
        userDisplay.innerText = `Logged in as: ${user.displayName}`;
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        editorSection.style.display = 'none';
        userDisplay.innerText = '';
    }
});

// --- DATABASE: POSTING ---
postBtn.onclick = async () => {
    const text = docInput.value.trim();
    if (!text) return;

    try {
        await addDoc(collection(db, "posts"), {
            content: text,
            uid: auth.currentUser.uid,
            author: auth.currentUser.displayName,
            createdAt: new Date()
        });
        docInput.value = ""; // Reset the box
    } catch (e) {
        alert("Error posting: " + e.message);
    }
};

// --- DATABASE: REAL-TIME FEED ---
// This listens for any changes in the database and updates the screen automatically
const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
    docContainer.innerHTML = "";
    snapshot.forEach((postDoc) => {
        const data = postDoc.data();
        const id = postDoc.id;
        const isOwner = auth.currentUser && auth.currentUser.uid === data.uid;

        const postEl = document.createElement('div');
        postEl.className = 'post-card';
        postEl.innerHTML = `
            <p>${data.content}</p>
            <div class="post-footer">
                <small>By ${data.author}</small>
                ${isOwner ? `<button class="delete-btn" data-id="${id}">Delete</button>` : ""}
            </div>
        `;
        docContainer.appendChild(postEl);
    });

    // Re-attach delete listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = async () => {
            const docId = btn.getAttribute('data-id');
            if (confirm("Are you sure you want to delete this post?")) {
                await deleteDoc(doc(db, "posts", docId));
            }
        };
    });
});
