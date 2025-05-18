// Some values to draw the svg object
var margin = { top: 40, right: 40, bottom: 40, left: 40 };
var width = 1000 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", function () {
        return "translate(" + margin.left + "," + margin.top + ")";
    });

// Defining some scales, without the domain to remain independent from the data
var xScale = d3.scaleBand().range([0, width]).padding(0.2);
var pScaleLegs = d3.scaleLinear().range([50, height * 0.3]);
var pScaleArms = d3.scaleLinear().range([50, height * 0.3]);
var pScaleTorso = d3.scaleLinear().range([50, height * 0.3]);
var pScaleHead = d3.scaleLinear().range([50, height * 0.3]);

function setXScaleDomain(data) {
    xScale.domain(data.map(function (d) { return d.id; }));
}

function setPScaleLegs(data) {
    pScaleLegs.domain([d3.min(data, function (d) { return d.legs; }), d3.max(data, function (d) { return d.legs; })]);
}

function setPScaleArms(data) {
    pScaleArms.domain([d3.min(data, function (d) { return d.arms; }), d3.max(data, function (d) { return d.arms; })]);
}

function setPScaleTorso(data) {
    pScaleTorso.domain([d3.min(data, function (d) { return d.torso; }), d3.max(data, function (d) { return d.torso; })]);
}
function setPScaleHead(data) {
    pScaleHead.domain([d3.min(data, function (d) { return d.head; }), d3.max(data, function (d) { return d.head; })]);
}

function drawPeople(data) {

    setXScaleDomain(data);
    setPScaleLegs(data);
    setPScaleArms(data);
    setPScaleTorso(data);
    setPScaleHead(data);

    var people = svg.selectAll("g.person")
        .data(data, function (d) { return d.id; });

    var person = people.enter().append("g")
        .attr("class", "person")
        .attr("transform", function (d) {
            return "translate(" + xScale(d.id) + ",0)";
        });

    person.each(function (d) {
        var p = d3.select(this);
        var person_space = xScale.bandwidth();
        var centerX = person_space / 2;

        // Legs
        p.append("rect")
            .attr("class", "legs")
            .attr("x", centerX - (person_space * 0.8) / 2)
            .attr("y", height - pScaleLegs(d.legs))
            .attr("width", person_space * 0.8)
            .attr("height", pScaleLegs(d.legs))
            .style("fill", "blue")
            .style("stroke", "red")
            .style("stroke-width", 2);

        p.append("line")
            .attr("class", "legs-divider")
            .attr("x1", centerX)                                     // center of the rect
            .attr("y1", height - pScaleLegs(d.legs))                 // top of the legs
            .attr("x2", centerX)                                     // same x
            .attr("y2", height)                                      // bottom of the SVG (“ground”)
            .attr("stroke", "red")
            .attr("stroke-width", 2);

        // Arms
    });


};

var data = d3.json("data_cases.json");

// Calling some functions on the dataset to create the visualization
data.then(function (data) {
    drawPeople(data);
}).catch(function (error) {
    console.error('Error loading the data: ', error);
});


