// Send message to content script to get font usage in current tab
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {msg: "getFonts"}, function(response) {
        var div = document.getElementById('char-count-container');

        // Get the count and display it in a bar chart
        var ctx = document.getElementById("char-count-chart");

        var labels = [];
        var data = [];

        for (var font in response) {
            if (response.hasOwnProperty(font)) {
                labels.push(font);
                data.push(response[font]);
            }
        }

        var data = {
            labels: labels,
            datasets: [
                {
                    borderWidth: 1,
                    data: data
                }
            ]
        };
        var options = {
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    display: false
                }],
                yAxes: [{
                    gridLines: {
                        display: false
                    }
                }]
            }
        };
        var charCountChart = new Chart(ctx, {
            type: 'horizontalBar',
            data: data,
            options: options
        });
    });
});
