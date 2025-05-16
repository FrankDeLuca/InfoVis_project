// Setting some values for svg and axes
var margin = {top: 40, right: 40, bottom:40, left: 40};
var width = 1000 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var xScale = d3.scaleBand().range([0, width]).padding(0.1);
var yScale = d3.scaleLinear().range([height, 0]);
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function setXScaleDomain(data) {
  xScale.domain(data.map(function(d) { return d.id; }));
}

function setYScaleDomain(data) {
    yScale.domain([0, 100]);
}


function drawBars(data) {
    var bars = svg.selectAll(".bar").data(data, function(d) { return d.id; });
    bars.exit().remove();

    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xScale(d.id); })
        .attr("width", xScale.bandwidth())
        .attr("y", function(d) { return yScale(d.legs); })
        .attr("height", function(d) { return height - yScale(d.legs); });
}
// Reading the dataset from the JSON file
var data = d3.json("data_cases.json");

// Calling some functions on the dataset to create the visualization
data.then(function(data) {
    setXScaleDomain(data);
    setYScaleDomain(data);
    drawBars(data);
    setTimeout(function() {
        data.sort(function(a, b) {
            return d3.ascending(a.legs, b.legs);
        });
        setXScaleDomain(data);
        d3.select("body").on("click", function(d) {
            svg.selectAll(".bar")
                .transition()
                .duration(3000)
                .attr("x", function(d) { return xScale(d.id); });
        });
    }, 100);
}).catch(function(error) {
    console.error('Error loading the data: ', error);
});
