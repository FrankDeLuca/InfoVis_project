// Some boundaries to draw the svg object
var margin = { top: 40, right: 40, bottom: 40, left: 40 };
var width = 1000 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

// Drawing the svg object and appending it to the body
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", function () {
        return "translate(" + margin.left + "," + margin.top + ")";
    });

// Defining some scales, without the domain to remain independent from the data
var xScale = d3.scaleBand().range([0, width]).padding(0.2);
var pScaleLegs = d3.scaleLinear().range([50, height * 0.3]); // Scaling the variables to a maximum of 30% of the height
var pScaleArms = d3.scaleLinear().range([50, height * 0.2]);
var pScaleTorso = d3.scaleLinear().range([50, height * 0.3]);
var pScaleHead = d3.scaleLinear()


// Creating the functions to set the domains of the scales
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


// Function to color the people with a gradient based on their index
function colorPeopleGradient() {
    svg.selectAll("g.person").each(function (d, i) {
        d3.select(this).selectAll('.head, .legs, .torso, .arms')
            .attr("data-original-fill", colorScale(i))
            .transition().duration(650)
            .style("fill", colorScale(i));
    });
}

// Function to sort people by a specific attribute
var isSorting = false; // Flag to prevent multiple clicks during sorting

function sortPeopleByAttribute(data, attribute) {

    if (isSorting) return; // Prevent multiple clicks
    isSorting = true;

    data.sort(function (a, b) {
        return d3.ascending(a[attribute], b[attribute]);
    });

    xScale.domain(data.map(function (d) { return d.id; })); // Update the xScale domain based on sorted data
    var transition = svg.selectAll("g.person")
        .sort(function (a, b) { return d3.ascending(a[attribute], b[attribute]); })
        .transition().duration(2500)
        .attr("transform", function (d) {
            return "translate(" + xScale(d.id) + ",0)";
        });

    transition.end().then(function () {
        colorPeopleGradient();
        isSorting = false; // Allow sorting again the clicking
    });
}


// Function to draw the people based on the dataset
function drawPeople(data) {

    setXScaleDomain(data);
    setPScaleLegs(data);
    setPScaleArms(data);
    setPScaleTorso(data);
    setPScaleHead(data);

    // Update
    var people = svg.selectAll("g.person")
        .data(data, function (d) { return d.id; });

    // Enter
    var person = people.enter().append("g")
        .attr("class", "person")
        .attr("transform", function (d) {
            return "translate(" + xScale(d.id) + ",0)";
        });

    // Exit
    person.exit().remove();

    // Drawing the people inside a 'bounding box'
    person.each(function (d) {
        var p = d3.select(this);

        // Width and center of the 'bounding box'
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
            .attr("x1", centerX)                                     
            .attr("y1", height - pScaleLegs(d.legs))                 
            .attr("x2", centerX)                                    
            .attr("y2", height);                                      


        // Torso
        p.append("rect")
            .attr("class", "torso")
            .attr("x", centerX - (person_space * 0.6) / 2)
            .attr("y", height - pScaleLegs(d.legs) - pScaleTorso(d.torso))
            .attr("width", person_space * 0.6)
            .attr("height", pScaleTorso(d.torso));

        // Arms

        // Left Arm
        p.append("rect")
            .attr("class", "arms")
            .attr("x", (centerX - (person_space * 0.8) / 2) / 2)
            .attr("y", height - pScaleLegs(d.legs) - pScaleTorso(d.torso))
            .attr("width", (centerX - (person_space * 0.4) / 2) / 2)
            .attr("height", pScaleArms(d.arms));
        // Right Arm
        p.append("rect")
            .attr("class", "arms")
            .attr("x", (centerX + (person_space * 0.6) / 2) / 2 + person_space * 0.8 / 2)
            .attr("y", height - pScaleLegs(d.legs) - pScaleTorso(d.torso))
            .attr("width", (centerX - (person_space * 0.4) / 2) / 2)
            .attr("height", pScaleArms(d.arms));

        // Head
        pScaleHead.range([35, (person_space * 0.6) / 2]); // Setting the range for the head scale based on the person space
        p.append("circle")
            .attr("class", "head")
            .attr("cx", centerX)
            .attr("cy", height - pScaleLegs(d.legs) - pScaleTorso(d.torso) - pScaleHead(-d.head))
            .attr("r", pScaleHead(-d.head));
    });


    // Mouse events for the attributes
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


// Defining the color scale for the gradient
var colorScale;
var data = d3.json("data_cases.json");

// Calling the functions on the dataset to create the visualization
data.then(function (data) {

    // Setting the color scale based on the number of people in the dataset
    colorScale = d3.scaleSequential()
        .domain([0, data.length - 1])
        .interpolator(d3.interpolateRgb("#FEAC5E", "#8A2387"));
        
    // Actual drawing
    drawPeople(data);


}).catch(function (error) {
    console.error('Error loading the data: ', error);
});


