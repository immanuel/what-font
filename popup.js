// Set the chart font
Chart.defaults.global.defaultFontFamily = "'Lato', sans-serif";
Chart.defaults.global.layout = {padding: 10};

var defaultColors = [
    '#96ccff',
    '#9eebcf',
    '#ff725c', 
    '#a463f2',
    '#ffde37', 
];
var numColors = defaultColors.length;


// Send message to content script to get font usage in current tab
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {msg: "getFonts"}, function(response) {
        var div = document.getElementById('char-count-container');

        var labels = [];
        var data = [];
        var size_data = [];
        var bgcolors = [];
        var index = 0;
                
        // TODO: calculate font total from the fontSizeUsage
        for (var font in response.fontUsage) {
            if (response.fontUsage.hasOwnProperty(font)) {
                labels.push(font);
                data.push(response.fontUsage[font]);
                bgcolors.push(defaultColors[index % numColors]);

                size_data.push({label: font, backgroundColor: defaultColors[index % numColors], data: []});

                index++;
            }
        }

        // Display bar chart for simple font usage
        var ctx = document.getElementById("char-count-chart");
        var data = {
            labels: labels,
            datasets: [
                {
                    borderWidth: 1,
                    data: data,
                    backgroundColor: bgcolors
                }
            ]
        };
        var options = {
            legend: { display: false },
            scales: {
                xAxes: [{ display: false }],
                yAxes: [{ gridLines: { display: false } }]
            }
        };
        var charCountChart = new Chart(ctx, {
            type: 'horizontalBar',
            data: data,
            options: options
        });

        // Display line chart for distribution of size and font
        var size_ctx = document.getElementById("char-size-chart");

        var fontSizeCount;
        var size_data_length = size_data.length;
        var size_labels = []
        for (var fontSize in response.fontSizeUsage) {
            if (response.fontSizeUsage.hasOwnProperty(fontSize)) {
                size_labels.push(fontSize)
            }
        }

        size_labels.sort(function(a, b){return a-b})
        size_labels.forEach(function(fontSize){
            fontSizeCount = response.fontSizeUsage[fontSize];
            for (var i = 0; i < size_data_length; i++) {
                size_data[i].data.push(
                    (size_data[i].label in fontSizeCount) ? fontSizeCount[size_data[i].label] : 0
                );
            }
        });

        for (var i = 0; i<size_labels.length; i++){
            var size_total = 0
            for (var j = 0; j<size_data_length; j++){
                size_total += size_data[j].data[i]
            }
            for (var j = 0; j<size_data_length; j++){
                size_data[j].data[i] = 100.0*size_data[j].data[i]/size_total
            }
        }

        var minFont = size_labels[0]
        var maxFont = size_labels[size_labels.length - 1]
        var idx = 0

        for (var i = minFont; i < maxFont; i++) {
            if(i != size_labels[idx]) {
                size_data.forEach(function(d){
                    d.data.splice(idx, 0, 0);
                });
                size_labels.splice(idx, 0, i);
            }
            idx++;
        }

        var charSizeChart = new Chart(size_ctx, {
            type: 'bar', 
            data: {
                labels: size_labels,
                datasets: size_data
            },
            options: {
                scales: {
                    xAxes: [{
                        stacked: true
                    }], 
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        });
    });
});
