// set the dimensions and margins of the graph
var margin = {top: 20, right: 60, bottom: 60, left: 60},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svgCloud = d3.select("#wordcloud")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
//*PREPARE DATA*
// Convert CSV into an array of objects
d3.csv("./data/SwissvoteV2.csv").then(function (data) {


    var words = ["Armee", "Umweltpolitik", "Ausländerpolitik", "Flüchtlinge", "Stellung der Frau", "Homosexuelle", "Gentechnologie", "AHV", "Tierversuche", "Grundrechte"]
    
    //nest data
    var nestedData1 = Array.from(d3.nest()
        .key(function (d) {
            return d.d1e3;
        })
        .key(function (d) {
            return d.titel;
        }).entries(data))

    var nestedData2 = Array.from(d3.nest()
        .key(function (d) {
            return d.d2e3;
        })
        .key(function (d) {
            return d.titel;
        }).entries(data))

    var nestedData3 = Array.from(d3.nest()
        .key(function (d) {
            return d.d3e3;
        })
        .key(function (d) {
            return d.titel;
        }).entries(data))


    //join data
    var unfilteredData = nestedData1.concat(nestedData2).concat(nestedData3)

    //filter data
    var filteredData = unfilteredData.filter(function (value, index, arr) {
        return value.key === "3.21" || value.key === "9.31" || value.key === "10.31" || value.key === "10.32" || value.key === "10.33" || value.key === "10.38" || value.key === "11.41" || value.key === "10.21" || value.key === "11.42" || value.key === "1.62";
    });

    //join datafields with same category in one object
    var filteredDataSet = [{key: "3.21", values:[]},{key: "9.31", values:[]}, {key: "10.31", values:[]}, {key: "10.32", values:[]}, {key: "10.33", values:[]}, {key: "10.38", values:[]},{key: "11.41", values:[]}, {key: "10.21", values:[]}, {key: "11.42", values:[]}, {key: "1.62", values:[]} ]

    filteredDataSet.forEach(function (el1, index) {
        filteredData.forEach(function (el2) {
            if (el1.key === el2.key) {
                filteredDataSet[index].values = filteredDataSet[index].values.concat(el2.values)
            }
        });
    });


    var layout = d3.layout.cloud()
        .size([width, height])
        .words(words.map(function (d) {
            return {text: d};
        }))
        .padding(5)
        .rotate(function () {
            return ~~(Math.random() * 2) * 90;
        })
        .fontSize(30)
        .on("end", draw);
    layout.start();

// This function takes the output of 'layout' above and draw the words
// Better not to touch it. To change parameters, play with the 'layout' variable above
    function draw(words) {
        svgCloud
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function (d) {
                return d.size + "px";
            })
            .style("font-family", "Arial")
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) {
                return d.text;
            });
        d3.layout.cloud().stop();
    }
})