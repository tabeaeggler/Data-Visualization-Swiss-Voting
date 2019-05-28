// set the dimensions and margins of the graph
var marginCloud = {top: 20, right: 120, bottom: 70, left: 120},
    widthCloud = 1150 - marginCloud.left - marginCloud.right,
    heightCloud = 600 - marginCloud.top - marginCloud.bottom;

// append the svg object to its container
var svgCloud = d3.select("#wordcloud")
    .append("svg")
    .attr("width", widthCloud + marginCloud.left + marginCloud.right)
    .attr("height", heightCloud + marginCloud.top + marginCloud.bottom)
    .attr("class", "cloud-words-container")
    .append("g")
    .attr("transform",
        "translate(" + marginCloud.left + "," + marginCloud.top + ")");

// Convert CSV into an array of objects
d3.csv("./data/SwissvoteV2.csv").then(function (data) {

    //*X AXIS*
    //domain for x-axis
    var yDomain = d3.extent(data, d => String(d.jahrzehnt).substr(0, d.jahrzehnt.length - 7));
    yDomain.splice(0, 1, "1860");

    var xAxisCloud = d3.scaleLinear()
        .domain(yDomain)
        .range([0, widthCloud])
        .nice();


    //*PREPARE DATA*
    //nest data
    var nestedDataCol1 = Array.from(d3.nest()
        .key(function (d) {
            return d.d1e3;
        })
        .key(function (d) {
            return d.titel;
        }).entries(data));

    var nestedDataCol2 = Array.from(d3.nest()
        .key(function (d) {
            return d.d2e3;
        })
        .key(function (d) {
            return d.titel;
        }).entries(data));

    var nestedDataCol3 = Array.from(d3.nest()
        .key(function (d) {
            return d.d3e3;
        })
        .key(function (d) {
            return d.titel;
        }).entries(data));


    //join nested data
    var unfilteredData = nestedDataCol1.concat(nestedDataCol2).concat(nestedDataCol3);

    var ruestung = "3.23",
        eu = "2.22",
        umweltpolitik = "9.31",
        auslaenderpolitik = "10.31",
        fluechtlinge = "10.32",
        frau = "10.33",
        homosexuelle = "10.38",
        gentech = "11.41",
        ahv = "10.21",
        tierversuche = "11.42",
        grundrechte = "1.62";

    //filter data for specific categories
    var filteredData = unfilteredData.filter(function (value, index, arr) {
        return value.key === ruestung || value.key === eu || value.key === umweltpolitik || value.key === auslaenderpolitik || value.key === fluechtlinge || value.key === frau || value.key === homosexuelle || value.key === gentech || value.key === ahv || value.key === tierversuche || value.key === grundrechte;
    });

    //join datafields with same category in one object
    var filteredDataSet = [{key: ruestung, values: []}, {key: eu, values: []}, {key: umweltpolitik, values: []}, {
        key: auslaenderpolitik,
        values: []
    }, {key: fluechtlinge, values: []}, {key: frau, values: []}, {key: homosexuelle, values: []}, {
        key: gentech,
        values: []
    }, {key: ahv, values: []}, {key: tierversuche, values: []}, {key: grundrechte, values: []}];

    filteredDataSet.forEach(function (el1, index) {
        filteredData.forEach(function (el2) {
            if (el1.key === el2.key) {
                filteredDataSet[index].values = filteredDataSet[index].values.concat(el2.values)
            }
        });

        //map numeric identifier of category to its name
        switch (el1.key) {
            case ruestung:
                el1.key = "Rüstung";
                break;
            case eu:
                el1.key = "EU";
                break;
            case umweltpolitik:
                el1.key = "Umweltpolitik";
                break;
            case auslaenderpolitik:
                el1.key = "Ausländerpolitik";
                break;
            case fluechtlinge:
                el1.key = "Flüchtlinge";
                break;
            case frau:
                el1.key = "Stellung der Frau";
                break;
            case homosexuelle:
                el1.key = "Homosexuelle";
                break;
            case gentech:
                el1.key = "Gentechnologie";
                break;
            case ahv:
                el1.key = "AHV";
                break;
            case tierversuche:
                el1.key = "Tierversuche";
                break;
            case grundrechte:
                el1.key = "Grundrechte";
                break;
            default:
        }
    });

    //*CREATE WORDCLOUD*
    //Credits to: https://www.d3-graph-gallery.com/graph/wordcloud_size.html
    //--> the following wordcloud implementation was inspired by the above mentioned source
    //--> some parts were copied and some adjusted for our own purpose

    var word_entries = d3.entries(filteredDataSet);

    //container for wordcloud
    var layout = d3.layout.cloud()
        .size([widthCloud, heightCloud - 100])
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
        .on("end", draw);
    layout.start();

    //draw actual words
    function draw(words) {
        svgCloud
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-size", function (d) {
                return d.value.values.length + 12 + "px";
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
            .on("mouseover", function () {
                d3.select(this)
                    .style("opacity", 0.5)
            })
            .on('mouseout', function () {
                d3.select(this)
                    .style("opacity", 1)
            })
            .on("click", function (d) {
                //change color of selected word when clicked
                d3.selectAll(".svg-cloud-text")
                    .style("fill", "#595959");

                d3.select(this)
                    .style("fill", '#FFFFFF');

                //remove votes of old selection
                svgCloud.selectAll("circle").remove();

                //draw x-Axis
                svgCloud.append("g")
                    .attr("transform", "translate(0," + heightCloud + ")")
                    .attr("class", "axis-cloud")
                    .call(d3.axisBottom(xAxisCloud).tickPadding(5).tickFormat(d3.format("d")).ticks(16));

                //draw circle for each vote
                svgCloud.selectAll("circle")
                    .data(d.value.values)
                    .enter()
                    .append("circle")
                    .attr("class", "circle")
                    .attr("cx", function (d) {
                        var x;
                        d.values.forEach(function (a) {
                            x = xAxisCloud(Number(a.datum.substr(a.datum.length - 4, a.datum.length - 1)));
                        });
                        return x;
                    })
                    .attr("cy", heightCloud - 20)
                    .attr("r", 5)
                    .style("fill", function (d) {
                        var col;
                        d.values.forEach(function (a) {
                            //color votes accordingly to their acceptance
                            if (a.annahme === "0") col = '#FF6B2D';
                            else col = '#018C9A';
                        });
                        return col;
                    });

                //add tooltip
                var tooltipCloud = d3.select("#wordcloud")
                    .append("div")
                    .classed("tip", true);

                d3.selectAll(".circle")
                    .on("mouseover", (d) => {
                        //change size of tooltip according to size of text
                        if (d.key.length <= 66) {
                            tooltipCloud
                                .classed("tooltip-short", true)
                                .classed("tooltip-long", false)
                                .classed("tooltip-extra-long", false)
                        } else if (d.key.length > 66 && d.key.length < 130) {
                            tooltipCloud
                                .classed("tooltip-long", true)
                                .classed("tooltip-short", false)
                                .classed("tooltip-extra-long", false)
                        } else if (d.key.length >= 130) {
                            tooltipCloud
                                .classed("tooltip-long", false)
                                .classed("tooltip-short", false)
                                .classed("tooltip-extra-long", true)

                        }
                        //position tooltip
                        tooltipCloud
                            .style("visibility", "visible")
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 110) + "px")
                            .html(d.key);
                    }).on("mouseout", () => {
                    tooltipCloud
                        .style("visibility", "hidden");
                });

                //create a legend for the bottom graph
                createLegend()

            });

        function createLegend() {
            var legend = svgCloud.append("g")
                .attr("id", "legend")
                .attr("transform", "translate(" + (widthCloud) + "," + (heightCloud) + ")");

            legend
                .append("circle")
                .attr("cx", 0)
                .attr("cy", 48)
                .attr("r", 5)
                .style("fill", '#018C9A');
            legend
                .append("text")
                .attr("class", "legend-txt")
                .text("angenommene Abstimmungen")
                .attr("x", -165)
                .attr("y", 51);
            legend
                .append("circle")
                .attr("cx", 0)
                .attr("cy", 63)
                .attr("r", 5)
                .style("fill", '#FF6B2D');
            legend
                .append("text")
                .attr("class", "legend-txt")
                .text("abgelehnte Abstimmungen")
                .attr("x", -165)
                .attr("y", 66)
        }

    }
});