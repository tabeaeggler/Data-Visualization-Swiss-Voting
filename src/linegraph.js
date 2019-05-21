var margin = {top: 20, right: 60, bottom: 60, left: 60},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

data = [
    {"category": "Sozialpolitik", "total": 110, "angenommen": 40, "abgelehnt": 70},
    {"category": "Umwelt", "total": 30, "angenommen": 12, "abgelehnt": 18},
    {"category": "Staatsordnung", "total": 190, "angenommen": 120, "abgelehnt": 70}
];

var line = d3.svg.line()
    .x(function (d) { return d.total})
    .y(function (d) { return height - d.total})
    .interpolate("linear");

var svgline = d3.select("#linegraph")
    .append("svg")
    .attr({
        "width": width,
        "height": height
    })

var path = svg.append("path")
    .attr({
        d:line(data),
        "fill": "none",
        "stroke": "blue",
        "stroke-width": "5px"
    })