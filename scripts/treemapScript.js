
var width = 0.85 * window.innerWidth,
    height = window.innerHeight * 0.75,
    radius = Math.min(width, height) / 2;


//var color = d3.scale.category20c();

var colors = ['#fff', '#9e9ac8', '#fdae6b', '#a1d99b'];

var currentYear = "2016";

//d3.select(self.frameElement).style("height", height + "px");

dataLoad();

function changeYear() {
    currentYear = document.getElementById("year-choice").value.toString();
    dataLoad();
}

function dataLoad(structure) {

    d3.json("treemapdata" + currentYear + ".json", function (error, root) {
                drawTree(error, root);
    })
}


function drawTree(error, root) {

    d3.select("#graph").selectAll("*").remove();

    var x = d3.scale.linear()
        .range([0, 2 * Math.PI]);

    var y = d3.scale.sqrt()
        .range([0, radius]);

    // Keep track of the node that is currently being displayed as the root.
    var node;


    var svg = d3.select("#graph").append("svg")
        .attr("width", width)
        .attr("height", height + 20)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

    var partition = d3.layout.partition()
        .sort(null)
        .value(function (d) {
            return d.size;
        });


    var arc = d3.svg.arc()
        .startAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
        })
        .endAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
        })
        .innerRadius(function (d) {
            return Math.max(0, y(d.y));
        })
        .outerRadius(function (d) {
            return Math.max(0, y(d.y + d.dy));
        });

    node = root;

    var g = svg.selectAll("g")
        .data(partition.nodes(root))
        .enter().append("g");

    var path = g.append("path")
        .attr("d", arc)
        .style("fill", function (d) {
            return colors[d.depth];
        })
        .on("dblclick", dblclick)
        .on("click", showValues)
        //.on("dblclick", hideValues)
        .each(stash);

    var text = g.append("text")
        .attr("class", "labels")
        .attr("display", function (d) {
            return d.dx > 0.01 ? 'block' : 'none';
        })
        .attr("transform", function (d) {
            return "translate(" + arc.centroid(d) + ")" + "rotate(" + computeTextRotation(d) + ")";
        })
        .attr("text-anchor", "middle")
        .attr("dy", ".35em") // vertical-align
        .text(function (d) {
            return d.name;
        });


    function dblclick(d) {

   
        node = d;

        // fade out all text elements
        text.transition().attr("display", 'none');

        path.transition()
            .duration(1000)
            .attrTween("d", arcTweenZoom(d))
            .each("end", function (e, i) {

                // check if the animated element's data e lies within the visible angle span given in d
                if (e.x >= d.x && e.x < (d.x + d.dx)) {
                    // get a selection of the associated text element
                    var arcText = d3.select(this.parentNode).select(".labels");
                    // fade in the text element and recalculate positions
                    arcText.transition()
                        .duration(1000)
                        .attr("display", function () {
                            if (node.parent && node.parent.name == e.name) {
                                return 'none';
                            } else {
                                return e.dx / node.dx > 0.01 ? 'block' : 'none';
                            }
                        })
                        .attr("transform", function (d) {
                            return d == node ? "translate(" + 2 * y(d.y) + ")" + "rotate(0)" : "translate(" + arc.centroid(d) + ")" + "rotate(" + computeTextRotation(d) + ")";
                        })
                        .attr("text-anchor", "middle")
                        .text(function (d) {
                            return d.name;
                        });
                }
            });
    }

    // Setup for switching data: stash the old values for transition.
    function stash(d) {
        d.x0 = d.x;
        d.dx0 = d.dx;
    }

    // When switching data: interpolate the arcs in data space.
    function arcTweenData(a, i) {
        var oi = d3.interpolate({
            x: a.x0,
            dx: a.dx0
        }, a);

        function tween(t) {
            var b = oi(t);
            a.x0 = b.x;
            a.dx0 = b.dx;
            return arc(b);
        }

        if (i == 0) {
            // If we are on the first arc, adjust the x domain to match the root node
            // at the current zoom level. (We only need to do this once.)
            var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
            return function (t) {
                x.domain(xd(t));
                console.log(tween(t))
                return tween(t);
            };
        } else {
            return tween;
        }
    }

    // When zooming: interpolate the scales.
    function arcTweenZoom(d) {
        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), [d.y, 1]),
            yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
        return function (d, i) {
            return i ?
                function (t) {
                    return arc(d);
                } :
                function (t) {
                    x.domain(xd(t));
                    y.domain(yd(t)).range(yr(t));
                    return arc(d);
                };
        };
    }

    function computeTextRotation(d) {
        var angle = (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180
        return (angle > 90 ? (angle - 180) : angle);
    }

    function computeTextPosition(d) {
        var angle = (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180
        return (angle > 90 ? -y(d.y) : y(d.y));

    }


}


function showValues(d) {
    
    d3.select("#show-values").selectAll("*").remove();
    
    if (d.depth >0) {

    //Show values on top of the graph
    var label = d3.select("#show-values");

    label.append("p")
        .attr("id", "value1")
        .text(d.fullname);

    label.append("p")
        .attr("id", "value2")
        .text("Amount: $" + d.size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))

    label.append("p")
        .attr("id", "value3")
        .text(function () {
            if (d.parent && d.depth>1) {
                return "Percentage: " + (d.size / d.parent.size * 100).toFixed(0) + "% of " + d.parent.fullname;
            } else {
                return "";
            }
        });
    }
}

function hideValues() {
    d3.select("#show-values").selectAll("*").remove();
}
