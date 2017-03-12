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

        /*
        size_data = [
            {label:'lato', bgclor: blue, data: []}, 
            {label:'lato', bgclor: blue, data: []}, 
            {label:'lato', bgclor: blue
                data: [{
                    x: -5,
                    y: 0
                }, {
                    x: 0,
                    y: 15
                }, {
                    x: 20,
                    y: 5
                }]

            }
        ]
        */

        var fontSizeCount;
        var size_data_length = size_data.length;
        console.log(response.fontSizeUsage);
        for (var fontSize in response.fontSizeUsage) {
            if (response.fontSizeUsage.hasOwnProperty(fontSize)) {
                fontSizeCount = response.fontSizeUsage[fontSize];

                // TODO: convert to % distribution
                for (var i = 0; i < size_data_length; i++) {
                    size_data[i].data.push({
                        x: fontSize, 
                        y: ((size_data[i].label in fontSizeCount) ? fontSizeCount[size_data[i].label] : 0)
                    });
                }
            }
        }

        var size_options = {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }], 
                yAxes: [{
                    stacked: 'true'
                }]
            }
        };

        console.log(size_data);

        var charSizeChart = new Chart(size_ctx, {
            type: 'line', 
            data: {datasets: size_data},
            options: size_options
        });
    });
});
