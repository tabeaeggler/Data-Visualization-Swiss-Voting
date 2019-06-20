// set the dimensions and margins of the graph
var margin = {top: 200, right: 60, bottom: 100, left: 60},
    width = 1350 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Add the SVG to the page
var svgLine = d3.select("#linegraph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "linegraph-container")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


//*PREPARE DATA*
// Convert CSV into an array of objects
d3.csv("./data/SwissvoteV2.csv").then(function (data) {

    //nest data
    var nested_data = d3.nest()
        .key(function(d) { return d.d1e1; })
        .rollup(function(l) { return l.length; })
        .entries(data);

    //Array with bottom values -> "mountain design"
    var bottom_values = [
        {key: 0, value: 0},
        {key: 0, value: 3},
        {key: 0, value: 3},
        {key: 0, value: 0},
        {key: 0, value: 7},
        {key: 0, value: 25},
        {key: 0, value: 25},
        {key: 0, value: 0},
        {key: 0, value: 5},
        {key: 0, value: 15},
        {key: 0, value: 0},
        {key: 0, value: 0}
    ]

    //mix array (nested data and bottom values) -> "mountain design"
    var mixed_data = new Array();
    for (i = 0; i < nested_data.length; i++) {
        mixed_data.push(bottom_values[i]);
        mixed_data.push(nested_data[i]);
    }
    //add last bottom value
    mixed_data.push({key: 0, value: 0});

    //count all abstimmungen
    var countAll = d3.sum(nested_data, function(d) {
        return d.value;
    });


    //*X & Y AXIS*
    var xScale = d3.scaleLinear()
        .domain([0, mixed_data.length]) // input
        .range([0, width ]); // output

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(mixed_data, function(d) { return +d.value; })])
        .range([ height, 0 ]);

    // array with all X and Y scale positions
    var yPositions = new Array();
    var xPositions = new Array();

    // array with X and Y scale positions -> just for mountain top data
    var yPositionsPeak = new Array();
    var xPositionsPeak = new Array();


    //*GENERATE PATH*
    // Append the path, bind the data & call the line generator
    var path = svgLine.append("path")
        .datum(mixed_data)
        .attr("class", "line")
        .attr("d", d3.line()
            .x(function(d, i) {
                xPositions.push(xScale(i));
                return xScale(i); }) // set the x values
            .y(function(d) {
                yPositions.push(yScale(d.value));
                return yScale(d.value); }) // set the y values
        )
    ;

    // Y & X scale positions just for mountain top data -> all odd numbers
    for (var i = 0; i < yPositions.length; i++){
        if (i % 2 != 0){
            yPositionsPeak.push(yPositions[i]);
        }
    }
    for (var i = 0; i < xPositions.length; i++){
        if (i % 2 != 0){
            xPositionsPeak.push(xPositions[i]);
        }
    }

    //draw lines from mountain peak
    for (var i = 0; i < yPositionsPeak.length; i++) {
        linesText = draw_lines(yPositionsPeak[i], xPositionsPeak[i], nested_data[i].key, nested_data[i].value);
    }


    //*Text description and vertical lines*
    function draw_lines(y, x, txt, value) {
        grp = txt
        switch (grp) {
            case "1":
                grp = "Staatsordung";
                break;
            case "2":
                grp = "Aussenpolitik";
                break;
            case "3":
                grp = "Sicherheitspolitik";
                break;
            case "4":
                grp = "Wirtschaft";
                break;
            case "5":
                grp = "Landwirtschaft";
                break;
            case "6":
                grp = "Öffentliche Finanzen";
                break;
            case "7":
                grp = "Energie";
                break;
            case "8":
                grp = "Verkehr und Infrastruktur";
                break;
            case "9":
                grp = "Umwelt";
                break;
            case "10":
                grp = "Sozialpolitik";
                break;
            case "11":
                grp = "Bildung und Forschung";
                break;
            case "12":
                grp = "Kultur, Religion, Medien";
                break;
            default:
        }

        svgLine.append("line")
            .style('opacity', 0)
            .attr("class", "linegraph-line")
            .attr("x1", x)
            .attr("y1", -20)
            .attr("x2", x)
            .attr("y2", y - 5)
            .transition()
            .delay(2800)
            .transition()
            .duration(1000)
            .style('opacity', 1);

        svgLine.append("text")
            .attr("class", "linegraph-txt")
            .style('opacity', 0)
            .attr("y", -27)
            .attr("x", x)
            .attr("transform", function (d) {
                var xRot = d3.select(this).attr("x");
                var yRot = d3.select(this).attr("y");
                return `rotate(-57 ${xRot},  ${yRot} )`
            })
            .transition()
            .delay(2800)
            .transition()
            .duration(1000)
            .style('opacity', 1)
            .text(grp);

        svgLine.append("text")
            .attr("class", "linegraph-txt")
            .style('opacity', 0)
            .attr("y", -27)
            .attr("x", x + 20)
            .attr("transform", function (d) {
                var xRot = d3.select(this).attr("x");
                var yRot = d3.select(this).attr("y");
                return `rotate(-57, ${xRot},  ${yRot} )` //ES6 template literal to set x and y rotation points
            })
            .transition()
            .delay(2800)
            .transition()
            .duration(1000)
            .style('opacity', 1)
            .text("(" + value + " Vorlagen" + ")");
    }

    var txtTotal = svgLine.append("text")
        .style('opacity', 0)
        .attr("x", 608)
        .attr("y", 350)
        .style("text-anchor", "middle")
        .text("Total Anzahl Vorlagen: " + countAll)
        .transition()
        .delay(2800)
        .transition()
        .duration(1000)
        .style('opacity', 1)
        .attr("class", "txt-total");


    //*ANIMATION*
    var totalLength = path.node().getTotalLength();

    path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(3000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
});