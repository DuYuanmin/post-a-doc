import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBlsafUS59DD_JCON_gOcnE_EW5w1se_7Q",
  authDomain: "share-a-doc.firebaseapp.com",
  projectId: "share-a-doc",
  storageBucket: "share-a-doc.firebasestorage.app",
  messagingSenderId: "963631712842",
  appId: "1:963631712842:web:4b36adce28779d7671b4b3",
  measurementId: "G-DBP931QFWV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const editor = document.getElementById('editor');
const postBtn = document.getElementById('postBtn');
const docInput = document.getElementById('docInput');
const docContainer = document.getElementById('docContainer');

// Auth Logic
loginBtn.onclick = () => signInWithPopup(auth, provider);
logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        editor.style.display = 'block';
    } else {
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        editor.style.display = 'none';
    }
});

// Post Logic
postBtn.onclick = async () => {
    const content = docInput.value.trim();
    if (!content || !auth.currentUser) return;
    
    try {
        await addDoc(collection(db, "posts"), {
            text: content,
            uid: auth.currentUser.uid,
            author: auth.currentUser.displayName,
            createdAt: new Date()
        });
        docInput.value = "";
    } catch (err) {
        alert("Error posting: " + err.message);
    }
};

// Feed Logic
const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
    docContainer.innerHTML = "";
    snapshot.forEach((postDoc) => {
        const data = postDoc.data();
        const id = postDoc.id;
        const isOwner = auth.currentUser && auth.currentUser.uid === data.uid;

        const div = document.createElement('div');
        div.className = 'post';
        div.innerHTML = `
            ${isOwner ? `<button class="delete-btn" onclick="deleteItem('${id}')">Delete</button>` : ''}
            <p>${data.text}</p>
            <small>By ${data.author || 'Anonymous'}</small>
        `;
        docContainer.appendChild(div);
    });
});

// Global function for delete button
window.deleteItem = async (id) => {
    if (confirm("Delete this post?")) {
        await deleteDoc(doc(db, "posts", id));
    }
};
