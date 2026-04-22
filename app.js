import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const editorSection = document.getElementById('editor-section');
const docContainer = document.getElementById('doc-container');

// --- AUTHENTICATION ---
loginBtn.onclick = () => signInWithPopup(auth, provider);

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.classList.add('hidden');
        editorSection.classList.remove('hidden');
        renderDocs(user);
    } else {
        loginBtn.classList.remove('hidden');
        editorSection.classList.add('hidden');
        renderDocs(null);
    }
});

// --- CREATE DOC ---
document.getElementById('post-btn').onclick = async () => {
    const title = document.getElementById('doc-title').value;
    const content = document.getElementById('doc-content').value;

    if (title && content) {
        await addDoc(collection(db, "documents"), {
            title,
            content,
            authorId: auth.currentUser.uid,
            authorName: auth.currentUser.displayName,
            createdAt: Date.now()
        });
        document.getElementById('doc-title').value = '';
        document.getElementById('doc-content').value = '';
    }
};

// --- READ & DELETE DOCS ---
function renderDocs(currentUser) {
    const q = query(collection(db, "documents"), orderBy("createdAt", "desc"));
    
    onSnapshot(q, (snapshot) => {
        docContainer.innerHTML = '';
        snapshot.forEach((d) => {
            const data = d.data();
            const div = document.createElement('div');
            div.className = 'doc-card';
            div.innerHTML = `
                <h3>${data.title}</h3>
                <p>${data.content}</p>
                <small>By: ${data.authorName}</small>
            `;

            // Only show delete button if current user is the author
            if (currentUser && currentUser.uid === data.authorId) {
                const delBtn = document.createElement('button');
                delBtn.innerText = "Delete";
                delBtn.onclick = () => deleteDoc(doc(db, "documents", d.id));
                div.appendChild(delBtn);
            }
            docContainer.appendChild(div);
        });
    });
}
