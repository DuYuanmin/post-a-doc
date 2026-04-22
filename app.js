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

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM 元素
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userDisplay = document.getElementById('user-display');
const editorSection = document.getElementById('editor-section');
const docContainer = document.getElementById('doc-container');

// --- 身份验证逻辑 ---
loginBtn.onclick = () => signInWithPopup(auth, provider);
logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.classList.add('hidden');
        userDisplay.classList.remove('hidden');
        editorSection.classList.remove('hidden');
        document.getElementById('user-name').innerText = `欢迎, ${user.displayName}`;
    } else {
        loginBtn.classList.remove('hidden');
        userDisplay.classList.add('hidden');
        editorSection.classList.add('hidden');
    }
    loadDocuments(user);
});

// --- 发布文档 ---
document.getElementById('post-btn').onclick = async () => {
    const title = document.getElementById('doc-title').value;
    const content = document.getElementById('doc-content').value;

    if (title && content && auth.currentUser) {
        try {
            await addDoc(collection(db, "documents"), {
                title: title,
                content: content,
                authorId: auth.currentUser.uid, // 必须存入这个 ID 以匹配安全规则
                authorName: auth.currentUser.displayName,
                createdAt: Date.now()
            });
            document.getElementById('doc-title').value = '';
            document.getElementById('doc-content').value = '';
        } catch (e) {
            alert("Failed to post");
        }
    }
};

// --- 加载并渲染文档 ---
function loadDocuments(currentUser) {
    const q = query(collection(db, "documents"), orderBy("createdAt", "desc"));
    
    onSnapshot(q, (snapshot) => {
        docContainer.innerHTML = '';
        snapshot.forEach((d) => {
            const data = d.data();
            const card = document.createElement('div');
            card.className = 'doc-card';
            
            let deleteBtnHtml = '';
            // 如果当前登录用户是作者，显示删除按钮
            if (currentUser && currentUser.uid === data.authorId) {
                deleteBtnHtml = `<button class="del-btn" data-id="${d.id}">delete</button>`;
            }

            card.innerHTML = `
                <h3>${data.title}</h3>
                <p>${data.content}</p>
                <div class="meta">作者: ${data.authorName}</div>
                ${deleteBtnHtml}
            `;
            
            docContainer.appendChild(card);
        });

        // 绑定删除事件
        document.querySelectorAll('.del-btn').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.getAttribute('data-id');
                if(confirm("You sure you want to delete？")) {
                    deleteDoc(doc(db, "documents", id));
                }
            };
        });
    });
}
