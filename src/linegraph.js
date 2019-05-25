// set the dimensions and margins of the graph
var margin = {top: 20, right: 60, bottom: 60, left: 60},
    width = 1200 - margin.left - margin.right,
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

    //example data
    data = [
        {"category": "Sozialpolitik", "total": 110, "status": "angenommen", "jaAnteil": 70, "neinAnteil": 30},
        {"category": "Umwelt", "total": 30, "status": "abgelehnt", "abgelehnt": 18, "jaAnteil": 49, "neinAnteil": 51},
        {"category": "Staatsordnung", "total": 190, "status": "abgelehnt", "abgelehnt": 70, "jaAnteil": 20, "neinAnteil": 80}
    ];

    //sum all abstimmungen
    var sum = d3.sum(data, function(d) {
        return d.total;
    });

    //nest data (angneommen + abgelehnt)
    var acceptedData = d3.nest().key(function (d) {
        return d.status;
    })

    // The number of datapoints
    var n = 21;

    // X scale
    var xScale = d3.scaleLinear()
        .domain([0, n-1]) // input
        .range([0, width]); // output
    //svgLine.append("g")
    //    .attr("transform", "translate(0," + height + ")")
    //    .call(d3.axisBottom(xScale));


    // Y scale -> random generate number
    var yScale = d3.scaleLinear()
        .domain([0, 1]) // input
        .range([height, 0]); // output
   // svgLine.append("g")
   //     .call(d3.axisLeft(yScale));

    // random numbers
    var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })

    // Append the path, bind the data, and call the line generator
    svgLine.append("path")
        .datum(dataset) // Binds data to the line
        .attr("class", "line")
        .attr("d", d3.line()
            .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
            .y(function(d) { return yScale(d.y); }) // set the y values for the line generator

        ); // Calls the line generator

    var txtTotal = svgLine.append("text")
        .attr("class", "txt-Total")
        .attr("x", 157)
        .attr("y", 0)
        .style("text-anchor", "middle")
        .text("Total Anzahl Abstimmungen: " + sum);


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













