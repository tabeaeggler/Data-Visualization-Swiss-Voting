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

    var words = ["Armee", "Umweltpolitik", "Tierschutz", "Ausländerpolitik", "Homosexuelle", "Gentechnologie", "Tierversuche", "Stellung der Frau", "Medienfreiheit", "Flüchtlinge", "Grundrechte"]


    var layout = d3.layout.cloud()
        .size([width, height])
        .words(words.map(function (d) {
            return {text: d};
        }))
        .padding(5)
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
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