// set the dimensions and margins of the graph
var margin = {top: 20, right: 60, bottom: 60, left: 60},
    width = 1400 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Add the SVG to the page
var svgLine = d3.select("#linegraph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


//*PREPARE DATA*
// Convert CSV into an array of objects
d3.csv("./data/SwissvoteV2.csv").then(function (data) {

    var nested_data = d3.nest()
        .key(function(d) { return d.d1e1; })
        .rollup(function(l) { return l.length; })
        .entries(data);

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

    var mixed_data = new Array();
    for (i = 0; i < nested_data.length; i++) {
        mixed_data.push(bottom_values[i]);
        mixed_data.push(nested_data[i]);
    }
    //add last bottom value
    mixed_data.push({key: 0, value: 0})


    //count all abstimmungen
    var countAll = d3.sum(nested_data, function(d) {
        return d.value;
    });




    //nest data (angneommen + abgelehnt)
    var acceptedData = d3.nest().key(function (d) {
        return d.status;
    })

    // X scale
    var xScale = d3.scaleLinear()
        .domain([0, mixed_data.length]) // input
        .range([0, width * 1.28]); // output

    // Y scale for all data
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(mixed_data, function(d) { return +d.value; })])
        .range([ height * 0.7, 0 ]);
    //svgLine.append("g").call(d3.axisLeft(yScale));

    // all X and Y scale positions
    var yPositions = new Array();
    var xPositions = new Array();

    // X and Y scale positions just for mountain top data
    var yPositionsPeak = new Array();
    var xPositionsPeak = new Array();

    // Append the path, bind the data, and call the line generator
    svgLine.append("path")
        .datum(mixed_data) // Binds data to the line
        .attr("class", "line")
        .attr("d", d3.line()
            .x(function(d, i) {
                xPositions.push(xScale(i))
                return xScale(i); }) // set the x values for the line generator
            .y(function(d) {
                yPositions.push(yScale(d.value))
                return yScale(d.value); }) // set the y values for the line generator

        )
    ; // Calls the line generator

    // Y scale positions just for mountain top data -> all odd numbers
    for (var i = 0; i < yPositions.length; i++){
        if (i % 2 != 0){
            yPositionsPeak.push(yPositions[i])
        }
    }
    // X scale positions just for mountain top data -> all odd numbers
    for (var i = 0; i < xPositions.length; i++){
        if (i % 2 != 0){
            xPositionsPeak.push(xPositions[i])
        }
    }

    //draw lines from mountain peak
    for (var i = 0; i < yPositionsPeak.length; i++) {
        draw_lines(yPositionsPeak[i], xPositionsPeak[i], nested_data[i].key);
    }


    function draw_lines(y, x, txt) {
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
                grp = "Öffentliche Finanzen";
                break;
            case "7":
                grp = "Energie";
                break;
            case "8":
                grp = "Verkehr und Infrastruktur";
                break;
            case "9":
                grp = "Umwelt und Lebensraum";
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
        y2 = y - 5;
        svgLine.append("line")
            .attr("class", "linegraph-line")
            .attr("x1", x)
            .attr("y1", 0)
            .attr("x2", x)
            .attr("y2", y - 5)

        svgLine.append("text")
            .attr("y", 0)
            .attr("x", x)
            .attr("class", "streamgraph-txt-info-timeline")
            .text(grp);
    }


    var txtTotal = svgLine.append("text")
        .attr("class", "txt-Total")
        .attr("x", 157)
        .attr("y", 0)
        .style("text-anchor", "middle")
        .text("Total Anzahl Abstimmungen: " + countAll);


    //TODO Checkbox
    d3.select("#checkbox-angenommen").on("change",updateAngenommen);
    updateAngenommen();

    d3.select("#checkbox-abgelehnt").on("change",updateAbgelehnt);
    updateAbgelehnt();

    function updateAngenommen() {
        if (d3.select("#checkbox-angenommen").property("checked")) {
            //TODO
        } else {
            //TODO
        }
    }
    function updateAbgelehnt() {
        if (d3.select("#checkbox-angenommen").property("checked")) {
            //TODO
        } else {
            //TODO
        }
    }
});













