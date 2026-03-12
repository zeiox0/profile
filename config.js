// إعدادات فايربيس الخاصة بموقعك
const firebaseConfig = {
  apiKey: "AIzaSyDoj4s2xxV94PkXdi1Oa2RRL-O-Iw3FQCI",
  authDomain: "my-bio-site-62d17.firebaseapp.com",
  projectId: "my-bio-site-62d17",
  storageBucket: "my-bio-site-62d17.firebasestorage.app",
  messagingSenderId: "38200019944",
  appId: "1:38200019944:web:01ef8acdf527fb4a8af25d",
  measurementId: "G-WPZ1KM4JJ9"
};

// تهيئة فايربيس
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();
