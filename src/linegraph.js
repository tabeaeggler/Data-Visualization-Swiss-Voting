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

    // Y scale
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(mixed_data, function(d) { return +d.value; })])
        .range([ height * 0.7, 0 ]);
    //svgLine.append("g").call(d3.axisLeft(yScale));

    // Append the path, bind the data, and call the line generator
    svgLine.append("path")
        .datum(mixed_data) // Binds data to the line
        .attr("class", "line")
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
            .y(function(d) { return yScale(d.value); }) // set the y values for the line generator

        ); // Calls the line generator

    var xValues = new Array();
    for(var i = 0; i < nested_data; i++){
        xValues.push(xValues + 20);
    }

    console.log(xValues)

    function draw_lines(y, x, line1) {
        svg.append("line")
            .attr("class", "linegraph-line")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x)
            .attr("y2", height)

        svg.append("text")
            .attr("y", y - 20)
            .attr("x", x)
            .text(line1);
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













