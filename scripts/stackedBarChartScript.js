
var svgBar = d3.select("#stackedchart").append("svg").attr("width", window.innerWidth).attr("height", 500),
    margin = {top: 20, right: 40, bottom: 30, left: 40},
    widthBar = +svgBar.attr("width") - margin.left - margin.right,
    heightBar = +svgBar.attr("height") - margin.top - margin.bottom,
    gBar = svgBar.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xBar = d3.scaleBand()
    .rangeRound([0, widthBar])
    .paddingInner(0.05)
    .align(0.1);

//var xBar = d3.scale.ordinal().rangeRoundBands([0,widthBar]);

var yBar = d3.scaleLinear()
    .rangeRound([heightBar, 0]);

var zBar = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

d3.csv("stackedBarChart.csv", function(d, i, columns) {
  for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
  d.total = t;
  return d;
}, function(error, data) {
  if (error) throw error;

  var keys = data.columns.slice(1);

  data.sort(function(a, b) { return b.total - a.total; });
  xBar.domain(data.map(function(d) { return d.type; }));
  yBar.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
  zBar.domain(keys);

  gBar.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter().append("g")
      .attr("fill", function(d) { return zBar(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return xBar(d.data.type); })
      .attr("y", function(d) { return yBar(d[1]); })
      .attr("height", function(d) { return yBar(d[0]) - yBar(d[1]); })
      .attr("width", xBar.bandwidth());

  gBar.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + heightBar + ")")
      .call(d3.axisBottom(xBar));

  gBar.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yBar).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", yBar(yBar.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Total Enrolment");

  var legendBar = gBar.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legendBar.append("rect")
      .attr("x", widthBar - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", zBar);

  legendBar.append("text")
      .attr("x", widthBar - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
});