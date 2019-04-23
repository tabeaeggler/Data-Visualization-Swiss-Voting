// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 30, left: 60},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var color1 = ['#8C0335', '#1C4259', '#63D8F2', '#F28A2E', '#F2CCB6'];
var color3 = ['#C5C8D9', '#8090A6', '#C8D98B', '#F2C1B6', '#A68686'];
var color4 = ['#8C3041', '#BDD9F2', '#D5E5F2', '#8A8C56', '#8C7558'];
var color5 = ['#A2CDF2', '#30698C', '#B6DBF2', '#748C5D', '#98A633'];
var color6 = ['#173F5F', '#20639B', '#3CAEA3', '#F6D55C', '#ED553B'];
var color7 = ['#C06C86', '#6D5C7C', '#325D7F', '#F9B294', '#F47081'];
var color8 = ['#FFF5ED', '#EEE4DD', '#89837F', '#CEC5BE', '#EE6060'];


// append the svg object to the body of the page
var svg = d3.select("#streamgraph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Convert CSV into an array of objects
d3.csv("./data/Swissvote.csv").then(function (data) {

    //nest data
    var nestedData = Array.from(d3.nest()
        .key(function (d) {
            return d.jahrzehnt;
        })
        .key(function (d) {
            return d.d1e1;
        })
        .rollup(function (v) {
            return v.length;
        })
        .entries(data))

    //tried to fill empty values
    // .map(function (obj) {
    //     if(obj.values.length < 12) {
    //         var existingValues = [];
    //         for(var i = 0; i < obj.values.length; i++) {
    //                 existingValues.push(i + 1)
    //         }
    //         console.log(existingValues);
    //         for(var j = 1; j <= 12; i++) {
    //             for(var k = 0; k < existingValues.length; k++) {
    //                if(existingValues [k] !== j) {
    //                    obj.values.push({key: j, values: 0})
    //                }
    //             }
    //         }
    //     }
    // });


    console.log(nestedData);

    const keys = d3.set(data.map(d => d.d1e1)).values();
    const yearDomain = d3.extent(data, d => String(d.jahrzehnt).substr(0, d.jahrzehnt.length - 7));
    const countDomain = [0, 100];


// Add X axis
    var xAxis = d3.scaleLinear()
        .domain(yearDomain)
        .range([0, width])
        .nice() //TODO: Why?
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xAxis).tickPadding(5).tickFormat(d3.format("d")));

// Add Y axis
    var yAxis = d3.scaleLinear()
        .domain(countDomain)
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(yAxis).tickPadding(2));

// color palette
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(color1)

//stack -> To build a streamgraph, data must be stacked
    var stackedData = d3.stack()
        .offset(d3.stackOffsetNone)
        .keys(keys)
        .value(function (d, key) {
            return d.values;
        })
        (nestedData)
    console.log(keys)
    console.log(stackedData)

    var area = d3.area()
        .x(function (d) {
            return xAxis(d.data.jahrzehnt);
        })
        .y0(function (d) {
            //console.log(d[0])}) //baseline
        })
        .y1(function (d) { //console.log(d[1])})
        })


// Show the areas -> Once the new coordinates are available, shapes can be added through path, using the d3.area() helper.
    svg
        .selectAll("layers")
        .data(stackedData)
        .enter()
        .append("path")
        .style("fill", function (d) {
            return color(d.key);
        })
        .attr("d", area)
})