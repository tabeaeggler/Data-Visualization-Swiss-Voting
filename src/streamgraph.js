// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 30, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var color1 = ['#8C0335','#1C4259','#63D8F2','#F28A2E','#F2CCB6'];
var color3 = ['#C5C8D9','#8090A6','#C8D98B','#F2C1B6','#A68686'];
var color4 = ['#8C3041','#BDD9F2','#D5E5F2', '#8A8C56', '#8C7558'];
var color5 = ['#A2CDF2','#30698C','#B6DBF2', '#748C5D', '#98A633'];
var color6 = ['#173F5F','#20639B','#3CAEA3', '#F6D55C', '#ED553B'];
var color7 = ['#C06C86','#6D5C7C','#325D7F', '#F9B294', '#F47081'];
var color8 = ['#FFF5ED','#EEE4DD','#89837F', '#CEC5BE', '#EE6060'];



// append the svg object to the body of the page
var svg = d3.select("#streamgraph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Convert CSV into an array of objects
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered_wide.csv", function(data) {
    console.log(data);
    // List of groups = header of the csv files
    var keys = data.columns.slice(1)
    console.log(keys);

    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.year; }))
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 200000])
        .range([ height, 0 ]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // color palette
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(color7)

    //stack -> To build a streamgraph, data must be stacked
    var stackedData = d3.stack()
        .offset(d3.stackOffsetNone) //stackOffsetSilhouette
        .keys(keys)
        (data)

    // Show the areas -> Once the new coordinates are available, shapes can be added through path, using the d3.area() helper.
    svg
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .style("fill", function(d) { return color(d.key); })
        .attr("d", d3.area()
            .x(function(d, i) { return x(d.data.year); })
            .y0(function(d) { return y(d[0]); })
            .y1(function(d) { return y(d[1]); })
        )
})