var fontUsage = {};
var fontSizeUsage = {};

// Calculate the number of characters using each font, under elem and aggregate
// in fontUsage
function getFonts(elem) {
    // Count length of text directly under this element
    // TODO: Garbage collect the cloned element
    var elemText = elem
        .clone()
        .children()
        .remove()
        .end()
        .text();
    elemText = elemText.replace(/\s/gm, "");
    
    // Add the length to the elem's font-family's running count
    //      and to the fontSizeUsage under the respective font-size
    // TODO: Handle case where ',' is present in the font name within '"'
    if (elemText.length > 0) {
        var elemFont = elem.css("font-family").split(",")[0].replace(/"/g, "").toLowerCase();
        var elemSize = elem.css("font-size").match('^[0-9.]*')[0]; 

        if (elemSize in fontSizeUsage) {
            fontSizeUsage[elemSize][elemFont] = elemText.length + 
                ((elemFont in fontSizeUsage[elemSize])? fontSizeUsage[elemSize][elemFont] : 0);
        }
        else {
            fontSizeUsage[elemSize] = {};
            fontSizeUsage[elemSize][elemFont] = elemText.length;
        }
        
        fontUsage[elemFont] = elemText.length + 
            ((elemFont in fontUsage)? fontUsage[elemFont] : 0);
    }
    
    // Get the same counts for the elem's children tags (but not script tags)
    elem.children().not("script").each(function() {
        getFonts($(this));
    });
    
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.msg == "getFonts") {

            // Initialize usage, incase the message is sent multiple times
            fontUsage = {};

            getFonts($("body"));

            // send parse results back to popup
            sendResponse({fontUsage: fontUsage, fontSizeUsage: fontSizeUsage});
        }
    });
