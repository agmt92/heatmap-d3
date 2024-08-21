const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const w = 1100;
const h = 550;
const margin = { top: 50, right: 75, bottom: 0, left: 30 }; // Adjusted margins

const tooltipFunct = (data) => {
    let year = data.year;
    let month = data.month;
    let variance = data.variance;
    let temperature = Math.floor((data.variance + 8.66) * 100) / 100;
    let result = `${year}, ${d3.utcFormat("%B")(d3.timeParse("%m")(month+1))} <br> Temperature:${temperature} <br> Variance: ${variance}℃`;
    return result;
}



const colorScaleFunc = (temperature) => {
    switch (true) {
        case (temperature >= 3.0 && temperature < 3.7):
            return "#00008b"; // Dark blue
        case (temperature >= 3.7 && temperature < 4.5):
            return "#0000ff"; // Blue
        case (temperature >= 4.5 && temperature < 6.0):
            return "#87CEFA"; // Light blue
        case (temperature >= 6.0 && temperature < 7.0):
            return "#ADD8E6"; // Very light blue
        case (temperature >= 7.0 && temperature < 7.5):
            return "#E0FFFF"; // Bluish white
        case (temperature >= 7.5 && temperature < 8.0):
            return "#FFFFFF"; // White
        case (temperature >= 8.0 && temperature < 8.7):
            return "#FFE4E1"; // Reddish white
        case (temperature >= 8.7 && temperature < 9.5):
            return "#FFA07A"; // Very light red
        case (temperature >= 9.50 && temperature < 10.0):
            return "#FA8072"; // Light red
        case (temperature >= 10.0 && temperature < 12.0):
            return "#FF0000"; // Red
        case (temperature >= 12.0 && temperature <= 14.0):
            return "#8B0000"; // Dark red
        default:
            return "#FFFFFF"; // White for out of range or default
    }
};


// Legend constants

const temperatureRanges = [
    { range: [3.0, 3.7], color: "#00008b" },
    { range: [3.7, 4.5], color: "#0000ff" },
    { range: [4.5, 6.0], color: "#87CEFA" },
    { range: [6.0, 7.0], color: "#ADD8E6" },
    { range: [7.0, 7.5], color: "#E0FFFF" },
    { range: [7.5, 8.0], color: "#FFFFFF" },
    { range: [8.0, 8.7], color: "#FFE4E1" },
    { range: [8.7, 9.5], color: "#FFA07A" },
    { range: [9.5, 10.0], color: "#FA8072" },
    { range: [10.0, 12.0], color: "#FF0000" },
    { range: [12.0, 14.0], color: "#8B0000" }
];

const legendWidth = 600;
const legendHeight = 50;
const legendMargin = { top: 10, right: 20, bottom: 30, left: 20 };

const legendSvg = d3.select("body").append("svg")
    .attr("id", "legend")
    .attr("class", "legend-svg")
    .attr("width", legendWidth + legendMargin.left + legendMargin.right + 20)
    .attr("height", legendHeight + legendMargin.top + legendMargin.bottom + 20)
    .style("position", "fixed")
    .style("right", "5px")
    .style("bottom", "5px")
    .style("background", "#dadada")
    .style("padding", "10px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "5px")
    .style("box-shadow", "inset 0 0 25px white")
    .append("g")
    .attr("transform", `translate(${legendMargin.left}, ${legendMargin.top})`);


const xScale = d3.scaleLinear()
    .domain([3.0, 14.0])
    .range([0, legendWidth]);

const xAxis = d3.axisBottom(xScale)
    .tickValues(temperatureRanges.map(d => d.range[0]).concat(14.0))
    .tickFormat(d3.format(".1f"));

legendSvg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(xAxis);

temperatureRanges.forEach(d => {
        legendSvg.append("rect")
            .attr("x", xScale(d.range[0]))
            .attr("y", 0)
            .attr("width", xScale(d.range[1]) - xScale(d.range[0]))
            .attr("height", legendHeight)
            .attr("fill", d.color);
    });

document.addEventListener('DOMContentLoaded', () => {
    d3.json(url)
        .then(d => {
            const baseTemp = d.baseTemperature;
            const dataset = d.monthlyVariance;
            const yearMax = d3.max(dataset, (d) => d.year) + 2;
            const yearMin = d3.min(dataset, (d) => d.year);
            const svg = d3.select("#chart")
                .append("svg")
                .attr("width", (w))
                .attr("height", h + margin.top + margin.bottom)
                .style("margin", `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`)
                .style("overflow", "visible");
            

            // Define the inner shadow filter
            const defs = svg.append("defs");
            const filter = defs.append("filter")
                .attr("id", "inner-shadow");


            filter.append("feComponentTransfer")
                .append("feFuncA")
                .attr("type", "table")
                .attr("tableValues", "0 3");

            filter.append("feGaussianBlur")
                .attr("stdDeviation", 3)
                .attr("result", "blur");

            filter.append("feOffset")
                .attr("dx", 1)
                .attr("dy", 1);

            filter.append("feComposite")
                .attr("operator", "out")
                .attr("in", "SourceGraphic")
                .attr("in2", "blur")
                .attr("result", "inverse");

            filter.append("feFlood")
                .attr("flood-color", "grey")
                .attr("result", "color");

            filter.append("feComposite")
                .attr("operator", "in")
                .attr("in", "color")
                .attr("in2", "inverse")
                .attr("result", "shadow");

            filter.append("feComposite")
                .attr("operator", "over")
                .attr("in", "shadow")
                .attr("in2", "SourceGraphic");
            

            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', 0)
                .attr('y', -10)
                .text('Month')
                .style("fill", "#333")
                .attr("filter", "url(#inner-shadow)");
            
            svg.append('text')
                .attr("id", "title")
                .attr('x', w / 1.2)
                .attr('y', h - margin.bottom + 40)
                .text('Year')
                .style("fill", "#333")
                .attr("filter", "url(#inner-shadow)");
            
                svg.append('text')
                .attr("id", "title")
                .attr('x', w / 1)
                .attr('y', h - margin.bottom + 60)
                .text('Code by AG')
                .style("fill", "#333")
                .attr("filter", "url(#inner-shadow)");
                
                svg.append('text')
                .attr("class", "title")
                .attr('x', w/2 + margin.left)
                .attr('y', -150)
                .text('Monthly Global Land-Surface Temperature')
                .attr("text-anchor", "middle")
                .style("font-size", "2em")
                .style("font-weight", "bold")
                .style("fill", "silver")
                .style("stroke", "silver")
                .style("stroke-width", "0.5px")
                .style("stroke-opacity", "0.2")
                .attr("filter", "url(#inner-shadow)");
                
                svg.append('text')
                .attr("id", "description")
                .attr('x', w/2 + margin.left)
                .attr('y', -120)
                .text("1753 - 2015: base temperature 8.66℃")
                .attr("text-anchor", "middle")
                .style("font-size", "1.5em")
                .style("fill", "silver")
                .style("stroke", "silver")
                .style("stroke-width", "0.5px")
                .style("stroke-opacity", "0.2")
                .attr("filter", "url(#inner-shadow)");
                
                const tooltip = d3.select("#chart")
                .append("div")
                .attr("id", "tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background-color", "rgba(0, 0, 0, 0.7)")
                .style("color", "white")
                .style("padding", "10px")
                .style("border-radius", "8px")
                .style("pointer-events", "none");

            const xScale = d3.scaleTime()
                .domain([d3.timeParse("%Y")(1753), d3.timeParse("%Y")(2015)])
                .range([0, w]);
            
            const yScale = d3.scaleTime()
                .domain([new Date(0, 0, 15.5), new Date(0, 12, 15.5)])
                .range([h - margin.bottom, 0]);
            
            const xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.timeFormat("%Y"))
                .scale(xScale);
            const yAxis = d3.axisLeft(yScale)
                .tickFormat(d3.utcFormat("%B"));

            svg.append("g")
                .call(xAxis)
                .attr("id", "x-axis")
                .attr("transform", `translate(${margin.left}, ${h - margin.bottom})`);

            svg.append("g")
                .call(yAxis)
                .attr("id", "y-axis")
                .attr("transform", `translate(${margin.left}, 0)`);

            svg.selectAll("rect")
                .data(dataset)
                .enter()
                .append("rect")
                .attr("x", d => xScale(d3.timeParse("%Y")(d.year)) + margin.left)
                .attr("y", d => yScale(new Date(0, d.month , 15.5)))
                .attr("fill", d => colorScaleFunc(baseTemp + d.variance))
                .attr("class", "cell")
                .attr("width", (w/(yearMax - yearMin)))
                .attr("height", (h/12))
                .attr("data-month", d => d.month -1)
                .attr("data-year", d => d.year)
                .attr("data-temp", d => baseTemp + d.variance)
                .on("mouseover", (event, d) => {
                    tooltip.attr("data-year", d.year);
                    tooltip.transition()
                        .duration(0)
                        .style("opacity", 0.9);
                        
                    tooltip.html(tooltipFunct(d))
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 200) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);

                
                
        })
}).catch(err => console.log(err));
});