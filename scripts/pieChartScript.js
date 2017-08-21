var widthPie = window.innerWidth * 0.85,
    heightPie = window.innerHeight * 0.75,
    radiusPie = Math.min(widthPie, heightPie) / 2;

var color = d3.scale.ordinal()
    .range(['#9e9ac8', '#a1d99b', '#fdae6b']);



d3.select("#piechart").append("text").text("*Graduate Diploma: 5 (1%)")

var svgPie = d3.select("#piechart").append("svg")
    .attr("width", widthPie)
    .attr("height", heightPie)
    .append("g")
    .attr("transform", "translate(" + widthPie / 2 + "," + heightPie / 2 + ")");


d3.csv("piedata.csv", types, function (error, data) {
    if (error) throw error;

    var arc = d3.svg.arc()
        .outerRadius(radiusPie - 10)
        .innerRadius(radiusPie - 70);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return d.number;
        });

    var g = svgPie.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function (d) {
            return color(d.data.type);
        });

    g.append("text")
        .attr("transform", function (d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .text(function (d) {
            return d.data.number > 10 ? d.data.number + " (" + (100 * Number(d.data.number) / 800).toFixed(0) + "%)" : "";
        });

    var legend = d3.select("#piechart-legend").append("svg")
        .attr("class", "legend")
        .attr("width", widthPie)
        .attr("height", (data.length) * 20)
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d) {
            return color(d.type);
        });

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function (d) {
            return d.type;
        });
});

function types(d) {
    d.number = +d.number;
    return d;
}
