// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 30, left: 60},
    width = 800 - margin.left - margin.right,
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
d3.csv("./data/Swissvote.csv", function(data) {
    console.log(data);
    // List of groups = header of the csv files
    var keys = data.columns.slice(1)
    console.log(keys);

    const yearDomain = d3.extent(data, d => String(d.jahrzehnt).substr(0, d.jahrzehnt.length - 7));
    console.log(yearDomain)

    // Add X axis
    var x = d3.scaleLinear()
        .domain(yearDomain)
        .range([ 0, width ])
        .nice() //TODO: Why?
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickPadding(5).tickFormat(d3.format("d")));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 100])
        .range([ height, 0 ]);
    svg.append("g")
        .call(d3.axisLeft(y).tickPadding(2));
})