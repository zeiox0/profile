// منع كليك يمين
document.addEventListener('contextmenu', event => event.preventDefault());

// منع اختصارات المطورين وفحص العناصر
document.addEventListener('keydown', event => {
    if (event.key === 'F12' || 
       (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'C' || event.key === 'J')) || 
       (event.ctrlKey && event.key === 'U')) {
        event.preventDefault();
    }
});
