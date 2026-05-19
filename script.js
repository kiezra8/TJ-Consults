// Initialize Lucide Icons
lucide.createIcons();

// --- Header Scroll Effect & Mobile Menu ---
const header = document.getElementById('header');
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');
let isMenuOpen = false;

window.addEventListener('scroll', () => {
    if (window.scrollY > 50 || isMenuOpen) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

menuBtn.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
        mobileMenu.classList.add('active');
        header.classList.add('scrolled');
        menuBtn.innerHTML = '<i data-lucide="x"></i>';
    } else {
        mobileMenu.classList.remove('active');
        if (window.scrollY <= 50) {
            header.classList.remove('scrolled');
        }
        menuBtn.innerHTML = '<i data-lucide="menu"></i>';
    }
    lucide.createIcons(); // Re-initialize icons
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        isMenuOpen = false;
        mobileMenu.classList.remove('active');
        if (window.scrollY <= 50) {
            header.classList.remove('scrolled');
        }
        menuBtn.innerHTML = '<i data-lucide="menu"></i>';
        lucide.createIcons();
    });
});

// --- Scroll Reveal Animations ---
const revealElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const elementVisible = 100;

    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
// Trigger once on load
revealOnScroll();

// --- Animated Counters ---
const counters = document.querySelectorAll('.counter');
let hasCounted = false;

const startCounters = () => {
    const statsSection = document.querySelector('.stats');
    if (!statsSection) return;
    
    const sectionTop = statsSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (sectionTop < windowHeight - 50 && !hasCounted) {
        hasCounted = true;
        
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // ms
            const increment = target / (duration / 16); // 60fps
            
            let current = 0;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                }
            };
            
            updateCounter();
        });
    }
};

window.addEventListener('scroll', startCounters);

// --- Smooth Scrolling for Anchor Links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            e.preventDefault();
            
            // Adjust offset for fixed header
            const headerHeight = header.offsetHeight;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = Math.max(0, elementPosition + window.scrollY - headerHeight);
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// --- Firebase Chat Integration ---
const firebaseConfig = {
  apiKey: "AIzaSyABc-7z4FWvqEC3LVs6BgekcvEgOgT6uYs",
  authDomain: "tj-consults.firebaseapp.com",
  projectId: "tj-consults",
  storageBucket: "tj-consults.firebasestorage.app",
  messagingSenderId: "683258220573",
  appId: "1:683258220573:web:6eb4bd9ec4ca548a62f6f4",
  measurementId: "G-QYQ2G2X663"
};

// Initialize Firebase (if not already initialized)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Create or get unique visitor ID to keep track of this session
let visitorId = localStorage.getItem('tj_visitor_id');
if (!visitorId) {
    visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('tj_visitor_id', visitorId);
}

// UI Elements
const chatToggleBtn = document.getElementById('chat-toggle-btn');
const chatCloseBtn = document.getElementById('chat-close-btn');
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// Toggle Chat Window
chatToggleBtn.addEventListener('click', () => {
    chatWindow.classList.remove('hidden');
    chatInput.focus();
    // Re-initialize Lucide icons in case they weren't rendered inside hidden container
    lucide.createIcons();
});

chatCloseBtn.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
});

// Function to render a message
const appendMessage = (text, type) => {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', type);
    msgDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom
};

// --- Admin Auth & Dynamic Chat Logic ---
let isAdmin = false;
let currentAdminChatVisitorId = null;
let visitorUnsubscribe = null;
let adminUnsubscribe = null;
let adminSessionUnsubscribe = null;
const auth = firebase.auth();
let isFirstLoad = true;

// Secret admin login trigger (double click avatar)
const triggerLogin = () => {
    if (!isAdmin) {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).catch(e => console.error(e));
    } else {
        if(confirm("Log out of Admin Dashboard?")) {
            auth.signOut();
        }
    }
};

document.querySelector('.chat-avatar').addEventListener('dblclick', triggerLogin);
document.getElementById('nav-login-btn').addEventListener('click', (e) => { e.preventDefault(); triggerLogin(); });
document.getElementById('mobile-login-btn').addEventListener('click', (e) => { e.preventDefault(); triggerLogin(); });

auth.onAuthStateChanged((user) => {
    const navLogin = document.getElementById('nav-login-btn');
    const mobileLogin = document.getElementById('mobile-login-btn');
    
    if (user && user.email === 'israelezrakisakye@gmail.com') {
        isAdmin = true;
        if(navLogin) navLogin.innerText = "Log Out";
        if(mobileLogin) mobileLogin.innerText = "Log Out";
        document.querySelector('.chat-header h4').innerText = "Admin Dashboard";
        document.getElementById('chat-subtitle').innerText = "Logged in as Admin";
        if (visitorUnsubscribe) visitorUnsubscribe();
        loadAdminChatsList();
    } else {
        isAdmin = false;
        if (user) {
            if(navLogin) navLogin.innerText = "Log Out";
            if(mobileLogin) mobileLogin.innerText = "Log Out";
        } else {
            if(navLogin) navLogin.innerText = "Log In";
            if(mobileLogin) mobileLogin.innerText = "Log In";
        }
        document.querySelector('.chat-header h4').innerText = "Admin Support";
        document.getElementById('chat-subtitle').innerText = "We typically reply in minutes";
        if (adminUnsubscribe) adminUnsubscribe();
        if (adminSessionUnsubscribe) adminSessionUnsubscribe();
        currentAdminChatVisitorId = null;
        chatInput.disabled = false;
        chatInput.placeholder = "Message...";
        loadVisitorChat();
    }
});

function loadVisitorChat() {
    isFirstLoad = true;
    chatMessages.innerHTML = '';
    appendMessage("Hello! How can we help you today? Leave a message and we'll get back to you!", 'received');
    
    visitorUnsubscribe = db.collection('chats').doc(visitorId).collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                  const data = change.doc.data();
                  appendMessage(data.text, data.sender === 'visitor' ? 'sent' : 'received');
              }
          });
          if (isFirstLoad) {
              chatMessages.scrollTop = chatMessages.scrollHeight;
              isFirstLoad = false;
          }
      });
}

function loadAdminChatsList() {
    chatMessages.innerHTML = '';
    chatInput.placeholder = "Select a chat...";
    chatInput.disabled = true;
    
    adminUnsubscribe = db.collection('chats').orderBy('lastUpdated', 'desc')
      .onSnapshot(snapshot => {
          if(currentAdminChatVisitorId) return; // Don't override if viewing a session
          chatMessages.innerHTML = '';
          if (snapshot.empty) {
              chatMessages.innerHTML = '<p style="text-align:center;color:#666;font-size:12px;margin-top:20px;">No chats yet</p>';
              return;
          }
          snapshot.forEach(doc => {
              const data = doc.data();
              const div = document.createElement('div');
              div.style = "padding: 12px; border-bottom: 1px solid #e5e7eb; cursor: pointer; border-radius: 8px; transition: 0.2s; margin-bottom: 4px;";
              div.onmouseover = () => div.style.backgroundColor = '#f1f5f9';
              div.onmouseout = () => div.style.backgroundColor = 'transparent';
              div.innerHTML = `<strong style="font-size:14px;color:var(--primary);">${doc.id.substring(0,12)}</strong><br><span style="font-size:12px;color:#666;">${data.lastMessage || 'No messages'}</span>`;
              div.onclick = () => loadAdminChatSession(doc.id);
              chatMessages.appendChild(div);
          });
      });
}

function loadAdminChatSession(vId) {
    currentAdminChatVisitorId = vId;
    chatMessages.innerHTML = '<div style="padding: 10px; font-size: 13px; cursor: pointer; color: var(--accent); font-weight:600; background:#f8fafc; border-radius:8px; text-align:center; margin-bottom:12px;" id="back-to-list">&larr; Back to chats</div>';
    
    document.getElementById('back-to-list').onclick = () => {
        if(adminSessionUnsubscribe) adminSessionUnsubscribe();
        currentAdminChatVisitorId = null;
        loadAdminChatsList();
    };

    chatInput.disabled = false;
    chatInput.placeholder = "Reply as admin...";

    adminSessionUnsubscribe = db.collection('chats').doc(vId).collection('messages').orderBy('timestamp', 'asc')
      .onSnapshot(snapshot => {
          // preserve back button
          const backBtn = chatMessages.firstElementChild;
          chatMessages.innerHTML = '';
          chatMessages.appendChild(backBtn);
          
          snapshot.forEach(doc => {
              const data = doc.data();
              appendMessage(data.text, data.sender === 'admin' ? 'sent' : 'received');
          });
          chatMessages.scrollTop = chatMessages.scrollHeight;
      });
}

// Handle Sending Messages
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = ''; // clear input
    
    try {
        if (isAdmin && currentAdminChatVisitorId) {
            await db.collection('chats').doc(currentAdminChatVisitorId).collection('messages').add({
                text: text,
                sender: 'admin',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            await db.collection('chats').doc(currentAdminChatVisitorId).set({
                lastMessage: "Admin: " + text,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'replied'
            }, { merge: true });
        } else if (!isAdmin) {
            await db.collection('chats').doc(visitorId).collection('messages').add({
                text: text,
                sender: 'visitor',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            await db.collection('chats').doc(visitorId).set({
                lastMessage: text,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                adminEmail: 'israelezrakisakye@gmail.com', // Info for tracking
                status: 'unread'
            }, { merge: true });
        }
    } catch (error) {
        console.error("Error sending message: ", error);
        alert("Could not send message. Please check your connection.");
    }
});
