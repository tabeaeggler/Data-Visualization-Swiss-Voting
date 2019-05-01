// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 60, left: 60},
    width = 1300 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var color1 = ['#001E50', '#026F94', '#018C9A', '#6BA99E', '#FDDFB1', '#FDAF6C', '#FF6B2D', '#FC3617'];
var color2 = ['rgba(255, 26, 39, 1)', 'rgba(255, 26, 39, 0.92)', 'rgba(255, 26, 39, 0.84)', 'rgba(255, 26, 39, 0.76)', 'rgba(255, 26, 39, 0.68)', 'rgba(255, 26, 39, 0.60)', 'rgba(255, 26, 39, 0.52)', 'rgba(255, 26, 39, 0.44)', 'rgba(255, 26, 39, 0.36)', 'rgba(255, 26, 39, 0.28)', 'rgba(255, 26, 39, 0.20)', 'rgba(255, 26, 39, 0.12)'];
var color3 = ['#862f34', '#932d34', '#a42931', '#b62932', '#c8242f', '#e11a27', '#e43641', '#de4751', '#da555e', '#d8646c', '#da757c', '#dc8e93']

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
                dataToBeStacked[index][prop] = 0.5
            }
        }
        //add decade and set value
        dataToBeStacked[index].decade = nestedData[index].key.substr(0, nestedData[index].key.length - 7)
        if (index == dataToBeStacked.length - 1) {
            dataToBeStacked[index].decade = "2020"
        }
    })

    //only show values beginning with 1860
    dataToBeStacked.splice(0, 1)

    const keys = d3.set(data.map(d => d.d1e1)).values();
    //starting with 1860 --> befor only one vote
    const yearDomain = d3.extent(data, d => String(d.jahrzehnt).substr(0, d.jahrzehnt.length - 7));
    yearDomain.splice(0, 1, "1860")
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
        .attr("x", 0 - (height / 2))
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

    var Tooltip = d3.select("div")
        .append("div")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("right", "100px")
        .style("z-index", "19")
        .style("top", "28px")
        .attr("class", "streamgraph-tooltip")

    verticalTooltip = d3.select("div")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("right", "100px")
        .style("z-index", "19")
        .style("width", "1px")
        .style("height", "421px")
        .style("top", "28px")
        .style("background", "#000000");


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

        mouse = d3.mouse(this);
        mousex = mouse[0]
        verticalTooltip.style("left", mousex + 65 + "px")
        Tooltip.style("left", mousex + 65 + "px")
        verticalTooltip.style("display", "block")
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
        mouse = d3.mouse(this);
        mousex = mouse[0];
        var invertedx = xAxis.invert(mousex).toString();
        var year
        var count
        d.forEach(function (f) {
            if (f.data.decade.toString().charAt(0) === invertedx.charAt(0)
                && f.data.decade.toString().charAt(1) === invertedx.charAt(1)
                && f.data.decade.toString().charAt(2) === invertedx.charAt(2)
                || invertedx > 2009) {

                if (invertedx > 2009) year = "2010 - 2019"
                else year = f.data.decade + " - " + (f.data.decade.substr(0, 3) + 9)

                count = (f.data[keys[i]] === 0.5) ? 0 : f.data[keys[i]]
            }
        })

        verticalTooltip.style("left", mousex + 65 + "px")
        Tooltip.style("left", mousex + 65 + "px")
        Tooltip.html(grp + "<br>" + "<p class='tooltip-paragraph'>" + year + ": " + count + " Abstimmungen" + "</p>")

    }
    var mouseleave = function (d) {
        Tooltip.style("opacity", 0)
        d3.selectAll(".myArea")
            .style("opacity", 1)
            .style("stroke", "none")
        d3.selectAll(".streamgraph-line-info-timeline")
            .style("visibility", "visible")
        d3.selectAll(".streamgraph-txt-info-timeline")
            .style("visibility", "visible")
        verticalTooltip.style("display", "none")

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


    //TODO Tabea: richtige x und y Werte hinzufügen -> wird nach Tooltip fertiggestellt :)
    //add lines and text for info-timeline
    draw_lines_lb(260, 480, "Start", "1. WK");
    draw_lines_lb(260, 518, "Ende", "1. WK");
    draw_lines_lb(220, 665, "Start", "2. WK");
    draw_lines_lb(220, 705, "Ende", "2. WK");
    draw_lines_lb(50, 870, "", "Frauenstimmrecht");
    draw_lines_lb(120, 940, "", "Ölpreiskrise");
    draw_lines_lb(290, 345, "Einführung der", "Volksinitiative");
    draw_lines_lb(20, 1070, "Totalrevision der", "Bundesverfassung");

    //function to draw lines and add text (with linebreak) for info-timeline
    function draw_lines_lb(y, x, line1, line2) {
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