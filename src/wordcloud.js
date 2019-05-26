// set the dimensions and margins of the graph
var margin = {top: 20, right: 120, bottom: 70, left: 120},
    width = 1150 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svgCloud = d3.select("#wordcloud")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "cloud-words-container")
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
        return value.key === "3.23" || value.key === "2.22" || value.key === "9.31" || value.key === "10.31" || value.key === "10.32" || value.key === "10.33" || value.key === "10.38" || value.key === "11.41" || value.key === "10.21" || value.key === "11.42" || value.key === "1.62";
    });

    //join datafields with same category in one object
    var filteredDataSet = [{key: "3.23", values: []}, {key: "2.22", values: []}, {key: "9.31", values: []}, {
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
            case "3.23":
                el1.key = "Rüstung";
                break;
            case "2.22":
                el1.key = "EU";
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

    console.log(word_entries)

    var layout = d3.layout.cloud()
        .size([width, height - 100])
        .words(word_entries)
        .text(function (d) {
            return d.value.key;
        })
        .padding(10)
        .fontSize(function (d) {
            return d.value.values.length + 15
        })
        .rotate(function () {
            return ~~(Math.random() * 2) * 90;
        })
        .on("end", draw)
    layout.start();


    function draw(words) {
        svgCloud
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-size", function (d) {
                return d.value.values.length + 15 + "px";
            })
            .attr("class", "svg-cloud-text")
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .attr("padding", "100")
            .text(function (d) {
                return d.value.key;
            })
            .on("mouseover", function (d) {
                d3.select(this)
                    .style("opacity", 0.5)
            })
            .on('mouseout', function (d) {
                d3.select(this)
                    .style("opacity", 1)
            })
            /* TODO HANNAH
            .on("click", function (d) {
                d3.selectAll(".svg-cloud-text")
                    .style("fill","#595959" )
                d3.select(this)
                    .style("fill", '#FFFFFF')

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
                    .attr("r", 5)
                    .style("fill", function (d) {
                        var x
                        d.values.forEach(function (a) {
                            if (a.annahme === "0") x = '#FF6B2D'
                            else x = '#018C9A'
                        })
                        return x
                    })

                var tooltip = d3.select("#wordcloud")
                    .append("div")
                    .classed("d3-tip", true);

                d3.selectAll(".circle")
                    .on("mouseover", (d, i) => {
                        console.log(d.key.length)
                        if (d.key.length <= 66) {
                            tooltip
                                .classed("tooltip-short", true)
                                .classed("tooltip-long", false)
                                .classed("tooltip-extra-long", false)
                        } else if (d.key.length > 66 && d.key.length < 130) {
                            console.log("long")
                            tooltip
                                .classed("tooltip-long", true)
                                .classed("tooltip-short", false)
                                .classed("tooltip-extra-long", false)
                        } else if (d.key.length >= 130) {
                            console.log("long")
                            tooltip
                                .classed("tooltip-long", false)
                                .classed("tooltip-short", false)
                                .classed("tooltip-extra-long", true)

                        }
                        tooltip
                            .style("visibility", "visible")
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 115) + "px")
                            .html(d.key);
                    }).on("mouseout", (d, i) => {
                    tooltip
                        .style("visibility", "hidden");
                });

                createLegend()

            })

        function createLegend() {
            var legend = svgCloud.append("g")
                .attr("id", "legend")
                .attr("transform", "translate(" + (width) + "," + (height) + ")")

            legend
                .append("circle")
                .attr("cx", 0)
                .attr("cy", 48)
                .attr("r", 5)
                .style("fill", '#018C9A')
            legend
                .append("text")
                .text("angenommene Abstimmungen")
                .attr("x", -165)
                .attr("y", 51)
            legend
                .append("circle")
                .attr("cx", 0)
                .attr("cy", 63)
                .attr("r", 5)
                .style("fill", '#FF6B2D')
            legend
                .append("text")
                .text("abgelehnte Abstimmungen")
                .attr("x", -165)
                .attr("y", 66)
        }

    }
})