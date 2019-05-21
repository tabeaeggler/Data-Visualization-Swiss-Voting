// set the dimensions and margins of the graph
var margin = {top: 20, right: 60, bottom: 60, left: 60},
    width = 1200 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

//example data
data = [
    {"category": "Sozialpolitik", "total": 110, "angenommen": 40, "abgelehnt": 70},
    {"category": "Umwelt", "total": 30, "angenommen": 12, "abgelehnt": 18},
    {"category": "Staatsordnung", "total": 190, "angenommen": 120, "abgelehnt": 70}
];

// The number of datapoints
var n = 21;

// X scale
var xScale = d3.scaleLinear()
    .domain([0, n-1]) // input
    .range([0, width]); // output

// Y scale -> random generate number
var yScale = d3.scaleLinear()
    .domain([0, 1]) // input
    .range([height, 0]); // output

// random numbers
var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })

// d3's line generator
var line = d3.line()
    .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
    .y(function(d) { return yScale(d.y); }) // set the y values for the line generator

// Add the SVG to the page
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Append the path, bind the data, and call the line generator
svg.append("path")
    .datum(dataset) // Binds data to the line
    .attr("class", "line")
    .attr("d", line); // Calls the line generator