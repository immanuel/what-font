// Send message to content script to get font usage in current tab
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {msg: "getFonts"}, function(response) {
        // TODO: Get the count and display it
        var div = document.getElementById('count');
        var content;

        for (var font in response) {
            if (response.hasOwnProperty(font)) {
                console.log(font + " used by " + response[font] + " character(s)");
                content = document.createElement('p');  
                content.innerHTML = font + " used by " + response[font] + " character(s)";
                div.appendChild(content);
            }
        }
    });
});
