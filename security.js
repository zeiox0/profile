// منع كليك يمين
document.addEventListener('contextmenu', event => {
    event.preventDefault();
    return false;
});

// منع اختصارات المطورين وفحص العناصر
document.addEventListener('keydown', event => {
    // F12
    if (event.key === 'F12') {
        event.preventDefault();
        return false;
    }
    
    // Ctrl+Shift+I (Inspect)
    if (event.ctrlKey && event.shiftKey && event.key === 'I') {
        event.preventDefault();
        return false;
    }
    
    // Ctrl+Shift+C (Inspect Element)
    if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        return false;
    }
    
    // Ctrl+Shift+J (Console)
    if (event.ctrlKey && event.shiftKey && event.key === 'J') {
        event.preventDefault();
        return false;
    }
    
    // Ctrl+U (View Source)
    if (event.ctrlKey && event.key === 'u') {
        event.preventDefault();
        return false;
    }
});
