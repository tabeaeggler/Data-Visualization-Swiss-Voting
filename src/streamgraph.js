// set the dimensions and margins of the graph
var marginStream = {top: 20, right: 60, bottom: 60, left: 60},
    widthStream = 1200 - marginStream.left - marginStream.right,
    heightStream = 500 - marginStream.top - marginStream.bottom;

// append the svg object to its container
var svg = d3.select("#streamgraph")
    .append("svg")
    .attr("width", widthStream + marginStream.left + marginStream.right)
    .attr("height", heightStream + marginStream.top + marginStream.bottom)
    .attr("class", "streamgraph-container")
    .append("g")
    .attr("transform",
        "translate(" + marginStream.left + "," + marginStream.top + ")");


//*PREPARE DATA*
// Convert CSV into an array of objects
d3.csv("./data/SwissvoteV2.csv").then(function (data) {

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
        .entries(data));

    //map values of nested data into a onedimensional array of objects
    var dataToBeStacked = [];
    nestedData.forEach(d => {
        var temp = {};
        d.values.forEach(e => {
            temp[e.key] = e.value;
        });
        dataToBeStacked.push(temp);
    });

    //crate default object
    var defaultObject = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, decade: ""};

    //fill missing values
    dataToBeStacked.forEach(function (a, index) {
        //add missing categories and initilize with zero
        for (prop in defaultObject) {
            if (!hasOwnProperty.call(a, prop)) {
                dataToBeStacked[index][prop] = 0.5;
            }
        }
        //add decade and set value
        dataToBeStacked[index].decade = nestedData[index].key.substr(0, nestedData[index].key.length - 7);
    });

    //only show values beginning with 1860
    dataToBeStacked.splice(0, 1);

    const keys = d3.set(data.map(d => d.d1e1)).values();

    //starting with 1860 --> before only one vote
    const yearDomain = d3.extent(data, d => String(d.jahrzehnt).substr(0, d.jahrzehnt.length - 7));
    yearDomain.splice(0, 1, "1860");

    const countDomain = [0, 110];

    //stack data to create streamgraph
    var stackedData = d3.stack()
        .offset(d3.stackOffsetNone)
        .keys(keys)
        (dataToBeStacked);


    //*X AND Y AXIS*
    //Add X axis
    var xAxis = d3.scaleLinear()
        .domain(yearDomain)
        .range([0, widthStream])
        .nice();

    svg.append("g")
        .attr("transform", "translate(0," + heightStream  + ")")
        .attr("class", "axis-streamgraph")
        .call(d3.axisBottom(xAxis).tickPadding(5).tickFormat(d3.format("d")).ticks(16));

    //add history lines
    svg.selectAll(".tickline")
        .attr("stroke", "#262626")

    //Add Y axis
    var yAxis = d3.scaleLinear()
        .domain(countDomain)
        .range([heightStream, 0]);

    svg.append("g")
        .attr("class", "axis-streamgraph")
        .call(d3.axisLeft(yAxis).tickPadding(2));

    //add Y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (heightStream / 2))
        .attr("y", 0 - marginStream.left)
        .attr("dy", "16pt")
        .attr("class", "axis-text-streamgraph")
        .style("text-anchor", "middle")
        .text("Anzahl Abstimmungen");


    //*COLOR PALETTE*
    var color1 = ['#001E50', '#026F94', '#018C9A', '#6BA99E', '#FDDFB1', '#FDAF6C', '#FF6B2D', '#FC3617', '#001E50', '#026F94', '#018C9A', '#6BA99E'];
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(color1);


    //*TOOLTIP*
    //Credits to: http://bl.ocks.org/WillTurman/4631136
    //--> the following tooltip implementation was inspired by the above mentioned source
    //--> some parts were copied and some adjusted for our own purpose
    var Tooltip = d3.select("#streamgraph")
        .append("div")
        .attr("class", "streamgraph-tooltip");

    var verticalTooltip = d3.select("#streamgraph")
        .append("div")
        .attr("class", "tooltip-line");

    //Donut Chart for Tooltip
    //Credits to: https://www.d3-graph-gallery.com/graph/donut_basic.html
    //--> the following donut chart implementation was inspired by the above mentioned source
    //--> some parts were copied and some adjusted for our own purpose
    function donutChart(countAll, count, colorIndex) {
        var widthDonut = 70,
            heightDonut = 70,
            marginDonut = 0,
            radius = Math.min(widthDonut, heightDonut) / 2 - marginDonut;

        var percentage = Math.round((100 / countAll * count) * 100) / 100;

        var donut = d3.select(".streamgraph-tooltip")
            .append("svg")
            .attr("width", widthDonut)
            .attr("heigh", heightDonut)
            .append("g")
            .attr("transform", "translate(" + widthDonut / 2 + "," + heightDonut / 2 + ")");

        var data = {
            current: count,
            all: countAll
        };

        //Color for donutchart
        calculatedColorIndex = colorIndex;
        switch (calculatedColorIndex) {
            case "1":
                calculatedColorIndex = 0;
                break;
            case "2":
                calculatedColorIndex = 8;
                break;
            case "3":
                calculatedColorIndex = 4;
                break;
            case "4":
                calculatedColorIndex = 3;
                break;
            case "5":
                calculatedColorIndex = 9;
                break;
            case "6":
                calculatedColorIndex = 2;
                break;
            case "7":
                calculatedColorIndex = 10;
                break;
            case "8":
                calculatedColorIndex = 5;
                break;
            case "9":
                calculatedColorIndex = 11;
                break;
            case "10":
                calculatedColorIndex = 6;
                break;
            case "11":
                calculatedColorIndex = 7;
                break;
            case "12":
                calculatedColorIndex = 1;
                break;
            default:
        }

        var color = d3.scaleOrdinal()
            .domain(data)
            .range([color1[calculatedColorIndex], '#A9A9A9']);

        var pie = d3.pie()
            .value(function (d) {
                return d.value;
            });

        var dataForDisplay = pie(d3.entries(data));

        //draw donut chart
        donut
            .selectAll('.streamgraph-tooltip')
            .data(dataForDisplay)
            .enter()
            .append('path')
            .attr('d', d3.arc()
                .innerRadius(23)
                .outerRadius(radius)
            )
            .attr('fill', function (d) {
                return (color(d.data.key))
            })

        donut.append("text")
            .attr("class", "txt-percentage")
            .attr("x", 0 + "px")
            .attr("y", 5 + "px")
            .style("text-anchor", "middle")
            .text(percentage + "%")
    }


    //*TOOLTIP HOVER / MOVE / LEAVE
    var mouseover = function () {
        Tooltip.style("opacity", 1);

        d3.selectAll(".streamgraph-tooltip")
            .style("display", "inline");

        d3.selectAll(".myArea")
            .style("opacity", .2);

        d3.select(this)
            .style("stroke", "white")
            .style("opacity", 0.8);

    };

    var mousemove = function (d, i) {
        //map keys to category names
        grp = keys[i];
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


        mouse = d3.mouse(this);
        mousex = mouse[0];
        var invertedx = xAxis.invert(mousex).toString(),
            year,
            count,
            countAllArray;

        //get values for vertical tooltip
        d.forEach(function (f) {
            if (f.data.decade.toString().charAt(0) === invertedx.charAt(0)
                && f.data.decade.toString().charAt(1) === invertedx.charAt(1)
                && f.data.decade.toString().charAt(2) === invertedx.charAt(2)
                || invertedx > 2009) {

                //value of decade shown in tooltip
                if (invertedx > 2009) year = "2010 - 2019";
                else year = f.data.decade + " - " + (f.data.decade.substr(0, 3) + 9);

                //count votes for tooltip
                count = (f.data[keys[i]] === 0.5) ? 0 : f.data[keys[i]];
                countAllArray = Object.values(f.data);
            }
        });

        //calculate position of mouse
        var mousePosX = svg.node().getBoundingClientRect().left + mousex + 65;

        // show Tooltips
        verticalTooltip.style("left", mousePosX + "px");
        verticalTooltip.style("display", "block");

        Tooltip.style("left", mousePosX + "px");
        Tooltip.html(grp + "<br>" + "<p class='tooltip-paragraph'>" + year + ": " + "<br>" + count + " Abstimmungen" + "</p>");

        //draw donut chart inside tooltip
        //delete decade for summing up
        countAllArray.pop();
        var countAll = countAllArray.reduce((total, current) => total + current, 0);
        donutChart(countAll, count, (keys[i]));

        //set info-timeline to hidden
        d3.selectAll(".streamgraph-line-info-timeline")
            .style("visibility", "hidden");

        d3.selectAll(".streamgraph-txt-info-timeline")
            .style("visibility", "hidden");
    };

    var mouseleave = function () {
        //hide all tooltips and infolines
        Tooltip.style("opacity", 0);
        verticalTooltip.style("display", "none");

        d3.selectAll(".streamgraph-tooltip")
            .style("display", "none");

        d3.selectAll(".myArea")
            .style("opacity", 1)
            .style("stroke", "none");

        d3.selectAll(".streamgraph-line-info-timeline")
            .style("visibility", "visible");

        d3.selectAll(".streamgraph-txt-info-timeline")
            .style("visibility", "visible");

        d3.selectAll(".txt-percentage")
            .style("visibility", "hidden");
    };


    //*SHOW SVG STREAMGRAPH*
    //Credits to: https://www.d3-graph-gallery.com/graph/streamgraph_basic.html
    //--> the following streamgraph implementation was inspired by the above mentioned source
    //--> some parts were copied and some adjusted for our own purpose
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
            .x(function (d) {
                if (d.data.decade !== "2010" && d.data.decade !== "1860") {
                    return xAxis(Number(d.data.decade) + 5);
                } else if (d.data.decade === "1860") {
                    return xAxis(d.data.decade);
                } else {
                    return xAxis(Number(d.data.decade) + 9);
                }
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
        .on("mouseleave", mouseleave);


    //*INFO-TIMELINE TEXT AND LINE
    //call functions
    draw_lines_lb(320, 363, "Start", "1. WK");
    draw_lines_lb(280, 397, "Ende", "1. WK");
    draw_lines_lb(320, 535, "Start", "2. WK");
    draw_lines_lb(280, 575, "Ende", "2. WK");
    draw_lines_lb(210, 595, "Start", "Kalter Krieg");
    draw_lines_lb(70, 746, "", "Frauenstimmrecht");
    draw_lines_lb(55, 872, "Ende", "Kalter Krieg");
    //draw_lines_lb(55, 775, "", "1.Ölkriese");
    //draw_lines_lb(55, 805, "", "2.Ölpreiskriese");
    draw_lines_lb(15, 940, "Totalrevision der", "Bundesverfassung");

    //function to draw lines and add text (with linebreak) for info-timeline
    function draw_lines_lb(y, x, line1, line2) {
        svg.append("line")
            .attr("class", "streamgraph-line-info-timeline")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x)
            .attr("y2", heightStream);

        svg.append("text")
            .attr("y", y - 20)
            .attr("x", x)
            .attr("class", "streamgraph-txt-info-timeline")
            .text(line1);

        svg.append("text")
            .attr("y", y - 5)
            .attr("x", x)
            .attr("class", "streamgraph-txt-info-timeline")
            .text(line2);
    }
});