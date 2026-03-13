
// إعدادات فايربيس (Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyDoj4s2xxV94PkXdi1Oa2RRL-O-Iw3FQCI",
  authDomain: "my-bio-site-62d17.firebaseapp.com",
  projectId: "my-bio-site-62d17",
  storageBucket: "my-bio-site-62d17.firebasestorage.app",
  messagingSenderId: "38200019944",
  appId: "1:38200019944:web:01ef8acdf527fb4a8af25d",
  measurementId: "G-WPZ1KM4JJ9"
};

// إعدادات سوبابيس (Supabase)
const supabaseConfig = {
    url: "https://mtdevelmgoinumifpcpb.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZGV2ZWxtZ29pbnVtaWZwY3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzM0MTMsImV4cCI6MjA4ODM0OTQxM30.xronBSbgZPVd79VDTEoLuB3XsCwQwGfB_uCW2hPIlMQ"
};

// تهيئة فايربيس
let db, auth, storage;
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();
    console.log("Firebase initialized");
}

// دالة تهيئة سوبابيس - تُستدعى عند الحاجة أو عند التأكد من تحميل المكتبة
function initSupabaseClient() {
    try {
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            window.supabaseClient = supabase.createClient(supabaseConfig.url, supabaseConfig.key);
            console.log("Supabase Client Initialized successfully");
            return true;
        } else {
            console.warn("Supabase library not ready yet");
            return false;
        }
    } catch (e) {
        console.error("Supabase initialization error:", e);
        return false;
    }
}

// محاولة التهيئة الفورية
if (!initSupabaseClient()) {
    // إذا فشلت، ننتظر تحميل الصفحة كاملاً
    window.addEventListener('load', function() {
        if (!window.supabaseClient) {
            initSupabaseClient();
        }
    });
    
    // محاولة إضافية بعد 500ms
    setTimeout(function() {
        if (!window.supabaseClient) {
            initSupabaseClient();
        }
    }, 500);
}
