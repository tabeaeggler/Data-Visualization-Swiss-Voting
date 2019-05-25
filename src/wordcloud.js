// set the dimensions and margins of the graph
var margin = {top: 20, right: 60, bottom: 60, left: 60},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svgCloud = d3.select("#wordcloud")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
//*PREPARE DATA*
// Convert CSV into an array of objects
d3.csv("./data/SwissvoteV2.csv").then(function (data) {

    //domain for x-axis
    const yearDomain = d3.extent(data, d => String(d.jahrzehnt).substr(0, d.jahrzehnt.length - 7));
    yearDomain.splice(0, 1, "1860")

    var xAxis = d3.scaleLinear()
        .domain(yearDomain)
        .range([0, width])
        .nice()

    //nest data
    var nestedData1 = Array.from(d3.nest()
        .key(function (d) {
            return d.d1e3;
        })
        .key(function (d) {
            return d.titel;
        }).entries(data))

    var nestedData2 = Array.from(d3.nest()
        .key(function (d) {
            return d.d2e3;
        })
        .key(function (d) {
            return d.titel;
        }).entries(data))

    var nestedData3 = Array.from(d3.nest()
        .key(function (d) {
            return d.d3e3;
        })
        .key(function (d) {
            return d.titel;
        }).entries(data))


    //join data
    var unfilteredData = nestedData1.concat(nestedData2).concat(nestedData3)

    //filter data
    var filteredData = unfilteredData.filter(function (value, index, arr) {
        return value.key === "3.21" || value.key === "9.31" || value.key === "10.31" || value.key === "10.32" || value.key === "10.33" || value.key === "10.38" || value.key === "11.41" || value.key === "10.21" || value.key === "11.42" || value.key === "1.62";
    });

    //join datafields with same category in one object
    var filteredDataSet = [{key: "3.21", values: []}, {key: "9.31", values: []}, {
        key: "10.31",
        values: []
    }, {key: "10.32", values: []}, {key: "10.33", values: []}, {key: "10.38", values: []}, {
        key: "11.41",
        values: []
    }, {key: "10.21", values: []}, {key: "11.42", values: []}, {key: "1.62", values: []}]

    filteredDataSet.forEach(function (el1, index) {
        filteredData.forEach(function (el2) {
            if (el1.key === el2.key) {
                filteredDataSet[index].values = filteredDataSet[index].values.concat(el2.values)
            }
        });
        switch (el1.key) {
            case "3.21":
                el1.key = "Armee";
                break;
            case "9.31":
                el1.key = "Umweltpolitik";
                break;
            case "10.31":
                el1.key = "Ausländerpolitik";
                break;
            case "10.32":
                el1.key = "Flüchtlinge";
                break;
            case "10.33":
                el1.key = "Stellung der Frau";
                break;
            case "10.38":
                el1.key = "Homosexuelle";
                break;
            case "11.41":
                el1.key = "Gentechnologie";
                break;
            case "10.21":
                el1.key = "AHV";
                break;
            case "11.42":
                el1.key = "Tierversuche";
                break;
            case "1.62":
                el1.key = "Grundrechte";
                break;
            default:
        }
    });

    var word_entries = d3.entries(filteredDataSet);

    var layout = d3.layout.cloud()
        .size([width, height])
        .words(word_entries)
        .text(function (d) {
            return d.value.key;
        })
        .padding(10)
        .fontSize(function (d) {
            return d.value.values.length + 20
        })
        .rotate(function () {
            return ~~(Math.random() * 2) * 90;
        })
        .on("end", draw)
    layout.start();

// This function takes the output of 'layout' above and draw the words
// Better not to touch it. To change parameters, play with the 'layout' variable above
    function draw(words) {
        svgCloud
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-size", function (d) {
                return d.value.values.length + 20 + "px";
            })
            .style("font-family", "Arial")
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .attr("padding", "100")
            .text(function (d) {
                return d.value.key;
            })
            .on("mouseover", handleMouseOver)
            .on('mouseout', handleMouseOut)
            .on("click", function (d) {

                svgCloud.selectAll("circle").remove()

                svgCloud.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(xAxis).tickPadding(5).tickFormat(d3.format("d")).ticks(16))

                svgCloud.selectAll("circle")
                    .data(d.value.values)
                    .enter()
                    .append("circle")
                    .attr("class", "circle")
                    .attr("cx", function (d) {
                        var x
                        d.values.forEach(function (a) {
                            x = xAxis(Number(a.datum.substr(a.datum.length - 4, a.datum.length - 1)))
                        })
                        return x
                    })
                    .attr("cy", height - 20)
                    .attr("r", 4)

                var tooltip = d3.select("#wordcloud")
                    .append("div")
                    .classed("tooltip", true);

                d3.selectAll('circle')
                    .on("mouseover", (d, i) => {
                        tooltip
                            .style("visibility", "visible")
                            .style("left",(d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 50) + "px")
                            .html(d.key);
                    }).on("mouseout", (d,i) =>{
                    tooltip
                        .style("visibility", "hidden");
                    verticalTooltip
                        .style("visibility", "hidden");
                });

            })

    }

    function handleMouseOver(d) {
        d3.select(this)
            .style("opacity", 0.7)
    }

    function handleMouseOut(d) {
        d3.select(this)
            .style("opacity", 1)
    }
})