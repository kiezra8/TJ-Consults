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

// Auth Modal Elements
const authModal = document.getElementById('auth-modal');
const authClose = document.getElementById('auth-close');
const authFormElement = document.getElementById('auth-form-element');
const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authToggleBtn = document.getElementById('auth-toggle-btn');
const authToggleText = document.getElementById('auth-toggle-text');
const authModalTitle = document.getElementById('auth-modal-title');
const authGoogleBtn = document.getElementById('auth-google-btn');

let isSignUp = false;

// Modal Controls
const openAuthModal = () => {
    authModal.classList.add('active');
    lucide.createIcons();
};

const closeAuthModal = () => {
    authModal.classList.remove('active');
};

authClose.addEventListener('click', closeAuthModal);

// Toggle between Log In and Sign Up
authToggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUp = !isSignUp;
    if (isSignUp) {
        authModalTitle.innerText = "Sign Up";
        authSubmitBtn.innerText = "Create Account";
        authToggleText.innerText = "Already have an account?";
        authToggleBtn.innerText = "Log In";
    } else {
        authModalTitle.innerText = "Log In";
        authSubmitBtn.innerText = "Log In";
        authToggleText.innerText = "Don't have an account?";
        authToggleBtn.innerText = "Sign Up";
    }
});

// Handle Email/Password Auth
authFormElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;
    
    if (isSignUp) {
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => {
                alert("Account created successfully!");
                closeAuthModal();
            })
            .catch(err => {
                alert("Error creating account: " + err.message);
            });
    } else {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                closeAuthModal();
            })
            .catch(err => {
                alert("Login failed: " + err.message);
            });
    }
});

// Handle Google Login
authGoogleBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(() => {
            closeAuthModal();
        })
        .catch(err => {
            alert("Google Sign-In Failed: " + err.message + "\n\n(Note: Google login requires running on localhost. If offline/local file, please use Email/Password Sign Up!)");
        });
});

// Login Trigger
const triggerLogin = () => {
    if (!auth.currentUser) {
        openAuthModal();
    } else {
        if(confirm("Log out?")) {
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
        document.getElementById('chat-back-btn').style.display = 'none';
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
    document.getElementById('chat-back-btn').style.display = 'none';
    
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
    chatMessages.innerHTML = '';
    
    const backBtn = document.getElementById('chat-back-btn');
    backBtn.style.display = 'flex';
    backBtn.onclick = () => {
        if(adminSessionUnsubscribe) adminSessionUnsubscribe();
        currentAdminChatVisitorId = null;
        loadAdminChatsList();
    };

    chatInput.disabled = false;
    chatInput.placeholder = "Reply as admin...";

    adminSessionUnsubscribe = db.collection('chats').doc(vId).collection('messages').orderBy('timestamp', 'asc')
      .onSnapshot(snapshot => {
          chatMessages.innerHTML = '';
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

// Open chat on Book Consultation
const ctaBookBtn = document.getElementById('cta-book-btn');
if (ctaBookBtn) {
    ctaBookBtn.addEventListener('click', (e) => {
        e.preventDefault();
        chatWindow.classList.remove('hidden');
        chatInput.focus();
        lucide.createIcons();
    });
}

// Open chat on Hero Consultation
const heroConsultationBtn = document.getElementById('hero-consultation-btn');
if (heroConsultationBtn) {
    heroConsultationBtn.addEventListener('click', (e) => {
        e.preventDefault();
        chatWindow.classList.remove('hidden');
        chatInput.focus();
        lucide.createIcons();
    });
}

// Open chat and send message on contact form submit
const contactForm = document.getElementById('contact-form-el');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('contact-first-name').value.trim();
        const lastName = document.getElementById('contact-last-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const service = document.getElementById('contact-service').value;
        const msg = document.getElementById('contact-message').value.trim();
        
        const formattedText = `📝 New Inquiry:\n• Name: ${firstName} ${lastName}\n• Email: ${email}\n• Service: ${service}\n• Message: ${msg}`;
        
        try {
            // Send inquiry to Firestore under the visitor's messages subcollection
            await db.collection('chats').doc(visitorId).collection('messages').add({
                text: formattedText,
                sender: 'visitor',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update the master chat doc
            await db.collection('chats').doc(visitorId).set({
                lastMessage: `Form: ${service} inquiry`,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                adminEmail: 'israelezrakisakye@gmail.com',
                status: 'unread'
            }, { merge: true });
            
            // Clear form
            contactForm.reset();
            
            // Open the chat window so they can see the message sent!
            chatWindow.classList.remove('hidden');
            chatInput.focus();
            lucide.createIcons();
            
        } catch (error) {
            console.error("Error sending form data: ", error);
            alert("We couldn't submit your form. You can message us directly in the chat window!");
        }
    });
}
