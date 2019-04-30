// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 60, left: 60},
    width = 1300 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var color1 = ['#001E50', '#026F94', '#018C9A', '#6BA99E', '#FDDFB1', '#FDAF6C', '#FF6B2D', '#FC3617'];

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


    //map values of nested data into a onedimensional array of objects
    var dataToBeStacked = []
    nestedData.forEach(d => {
        var temp = {}
        d.values.forEach(e => {
            temp[e.key] = e.value;
        })
        dataToBeStacked.push(temp);
    });


    //crate default object
    var defaultObject = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, decade: ""}

    //fill missing values
    dataToBeStacked.forEach(function (a, index) {
        //add missing categories and initilize with zero
        for (prop in defaultObject) {
            if (!hasOwnProperty.call(a, prop)) {
                console.log("object " + index)
                console.log("proberty " + prop + " is missing")
                dataToBeStacked[index][prop] = 0.5
            }
        }
        //add decade and set value
        dataToBeStacked[index].decade = nestedData[index].key.substr(0, nestedData[index].key.length - 7)
        if (index == dataToBeStacked.length - 1) {
            dataToBeStacked[index].decade = 2020
        }
    })


    const keys = d3.set(data.map(d => d.d1e1)).values();
    const yearDomain = d3.extent(data, d => String(d.jahrzehnt).substr(0, d.jahrzehnt.length - 7));
    const countDomain = [0, 110];


// Add X axis
    var xAxis = d3.scaleLinear()
        .domain(yearDomain)
        .range([0, width])
        .nice()

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xAxis).tickPadding(5).tickFormat(d3.format("d")))
            //.tickSize(-height)) --> würde Linien nach oben ziehen

    svg.selectAll(".tickline").attr("stroke", "#b8b8b8")

// Add Y axis
    var yAxis = d3.scaleLinear()
        .domain(countDomain)
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(yAxis).tickPadding(2));

    //add y-axis lable
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x",0 - (height / 2))
        .attr("y", 0 - margin.left)
        .attr("dy", "14pt")
        .attr("font-family", "sans-serif")
        .style("text-anchor", "middle")
        .text("Anzahl Abstimmungen");

    //add x-axis lable
    svg.append("text")
        .attr("x", width - 10)
        .attr("y", height + 30)
        .attr("dy", "14pt")
        .attr("font-family", "sans-serif")
        .style("text-anchor", "middle")
        .text("Zeit");

// color palette
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(color1)

    var stackedData = d3.stack()
        .offset(d3.stackOffsetNone)
        .keys(keys)
        (dataToBeStacked)

    var Tooltip = svg
        .append("text")
        .attr("x", 350)
        .attr("y", 200)
        .style("opacity", 0)
        .attr("class", "streamgraph-tooltip")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
        Tooltip.style("opacity", 1)
        d3.selectAll(".myArea")
            .style("opacity", .2)
        d3.select(this)
            .style("stroke", "white")
            .style("opacity", 1)
        d3.selectAll(".streamgraph-line-info-timeline")
            .style("visibility", "hidden")
        d3.selectAll(".streamgraph-txt-info-timeline")
            .style("visibility", "hidden")
    }
    var mousemove = function (d, i) {
        grp = keys[i]
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
                grp = "Soziale Fragen – Sozialpolitik";
                break;
            case "11":
                grp = "Bildung und Forschung";
                break;
            case "12":
                grp = "Kultur, Religion, Medien";
                break;
            default:

        }
        Tooltip.text(grp)
    }
    var mouseleave = function (d) {
        Tooltip.style("opacity", 0)
        d3.selectAll(".myArea")
            .style("opacity", 1)
            .style("stroke", "none")
        console.log("mouse has left")

        d3.selectAll(".streamgraph-line-info-timeline")
            .style("visibility", "visible")
        d3.selectAll(".streamgraph-txt-info-timeline")
            .style("visibility", "visible")
    }

    // Show the areas
    svg
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "myArea")
        .style("fill", function (d) {
            return color(d.key);
        })
        .attr("d", d3.area()
            .curve(d3.curveNatural)
            .x(function (d, i) {
                return xAxis(d.data.decade);
            })
            .y0(function (d) {
                return yAxis(d[0]);
            })
            .y1(function (d) {
                return yAxis(d[1]);
            })
        )
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)



    //add lines and text for info-timeline
    draw_lines(260, 1918, "Ende 1. WK");
    draw_lines(220, 705, "Ende 2. WK");
    draw_lines(50, 870, "Frauenstimmrecht");
    draw_lines(120, 940, "Ölpreiskrise");
    draw_lines_lb(340, 55, "Gründung des", "Bundesstaats");
    draw_lines_lb(290, 345, "Einführung der", "Volksinitiative");
    draw_lines_lb(20, 1070, "Totalrevision der", "Bundesverfassung");

    //function to draw lines and add text (single line) for info-timeline
    function draw_lines(y, x, txt){
        svg.append("line")
            .attr("class", "streamgraph-line-info-timeline")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x)
            .attr("y2", height);


        svg.append("text")
            .attr("y", y - 10)
            .attr("x", x)
            .attr('text-anchor', 'middle')
            .attr("font-family","sans-serif")
            .attr("font-size","13px")
            .attr("class", "streamgraph-txt-info-timeline")
            .text(txt);
    }

    //function to draw lines and add text (with linebreak) for info-timeline
    function draw_lines_lb(y, x, line1, line2){
        svg.append("line")
            .attr("class", "streamgraph-line-info-timeline")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x)
            .attr("y2", height)

        svg.append("text")
            .attr("y", y - 25)
            .attr("x", x)
            .attr("class", "streamgraph-txt-info-timeline")
            .text(line1);

        svg.append("text")
            .attr("y", y - 10)
            .attr("x", x)
            .attr("class", "streamgraph-txt-info-timeline")
            .text(line2);
    }

})