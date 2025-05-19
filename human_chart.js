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
var pScaleHead = d3.scaleLinear()

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

function colorPeopleGradient() {
    svg.selectAll("g.person").each(function (d, i) {
        d3.select(this).selectAll('.head, .legs, .torso, .arms')
            .attr("data-original-fill", colorScale(i))
            .transition().duration(650)
            .style("fill", colorScale(i));
    });
}


var isSorting = false;

function sortPeopleByAttribute(data, attribute) {

    if (isSorting) return; // Prevent multiple clicks
    isSorting = true;

    data.sort(function (a, b) {
        return d3.ascending(a[attribute], b[attribute]);
    });

    xScale.domain(data.map(function (d) { return d.id; }));
    var transition = svg.selectAll("g.person")
        .sort(function (a, b) { return d3.ascending(a[attribute], b[attribute]); })
        .transition().duration(2500)
        .attr("transform", function (d) {
            return "translate(" + xScale(d.id) + ",0)";
        });

    transition.end().then(function () {
        colorPeopleGradient();
        isSorting = false; // Allow sorting again
    });
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

    person.exit().remove();

    person.each(function (d) {
        var p = d3.select(this);
        var person_space = xScale.bandwidth();
        var centerX = person_space / 2;

        // Legs
        p.append("rect")
            .attr("class", "legs")
            .attr("x", centerX - (person_space * 0.6) / 2)
            .attr("y", height - pScaleLegs(d.legs))
            .attr("width", person_space * 0.6)
            .attr("height", pScaleLegs(d.legs));

        p.append("line")
            .attr("class", "legs-divider")
            .attr("x1", centerX)                                     // center of the rect
            .attr("y1", height - pScaleLegs(d.legs))                 // top of the legs
            .attr("x2", centerX)                                     // same x
            .attr("y2", height);                                      // bottom of the SVG (“ground”)


        // Torso
        p.append("rect")
            .attr("class", "torso")
            .attr("x", centerX - (person_space * 0.6) / 2)
            .attr("y", height - pScaleLegs(d.legs) - pScaleTorso(d.torso))
            .attr("width", person_space * 0.6)
            .attr("height", pScaleTorso(d.torso));

        // Arms
        p.append("rect")
            .attr("class", "arms")
            .attr("x", (centerX - (person_space * 0.8) / 2) / 2)
            .attr("y", height - pScaleLegs(d.legs) - pScaleTorso(d.torso))
            .attr("width", (centerX - (person_space * 0.4) / 2) / 2)
            .attr("height", pScaleArms(d.arms));

        p.append("rect")
            .attr("class", "arms")
            .attr("x", (centerX + (person_space * 0.6) / 2) / 2 + person_space * 0.8 / 2)
            .attr("y", height - pScaleLegs(d.legs) - pScaleTorso(d.torso))
            .attr("width", (centerX - (person_space * 0.4) / 2) / 2)
            .attr("height", pScaleArms(d.arms));

        // Head
        pScaleHead.range([35, (person_space * 0.6) / 2]);
        p.append("circle")
            .attr("class", "head")
            .attr("cx", centerX)
            .attr("cy", height - pScaleLegs(d.legs) - pScaleTorso(d.torso) - pScaleHead(-d.head))
            .attr("r", pScaleHead(-d.head));
    });

    ['legs', 'arms', 'torso', 'head'].forEach(function (attribute) {

        svg.selectAll("." + attribute)
            .on("mouseover", function () {
                d3.select(this)
                    .style("fill", "plum")
            })
            .on("mouseout", function () {
                d3.select(this)
                    .style("stroke", "white")
                    .style("stroke-width", 4)
                    .style("fill", d3.select(this).attr("data-original-fill"));
            }).on("click", function () {
                sortPeopleByAttribute(data, attribute);
            });
    });
};

var colorScale;
var data = d3.json("data_cases.json");

// Calling some functions on the dataset to create the visualization
data.then(function (data) {

    colorScale = d3.scaleSequential()
        .domain([0, data.length - 1])
        .interpolator(d3.interpolateRgb("#FEAC5E", "#8A2387"));

    drawPeople(data);
}).catch(function (error) {
    console.error('Error loading the data: ', error);
});


