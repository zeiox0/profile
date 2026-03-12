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

// إعدادات سوبابيس (Supabase) - يرجى استبدال القيم عند توفرها
const supabaseConfig = {
    url: "https://your-project-id.supabase.co",
    key: "your-anon-key"
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

// تهيئة سوبابيس (إذا تم تضمين المكتبة)
let supabase;
if (typeof supabasejs !== 'undefined') {
    supabase = supabasejs.createClient(supabaseConfig.url, supabaseConfig.key);
    console.log("Supabase initialized");
}
