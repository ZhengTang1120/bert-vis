var x_scale = d3.scaleLinear().domain([x0, x1]).range([25, 800]);
var y_scale = d3.scaleLinear().domain([y0, y1]).range([800, 25]);

div = d3.select("#main_div").append("div");
var s1 = div.append("svg").attr("id", "scatterplot_1").attr("height", 825).attr("width", 825);
var enter_s1 = s1.append("g").attr("class", "node").selectAll("circle").data(scores).enter().append("circle");
enter_s1.attr("cx", function(d) {
    console.log(d.X);
    return x_scale(d.X);
});
enter_s1.attr("cy", function(d) {
    return y_scale(d.Y);
});
enter_s1.attr("r", 4);
enter_s1.attr("fill", "grey");

var g_y = s1.append("g").attr("transform", "translate(25,0)").call(d3.axisLeft(y_scale).ticks(5));
var g_x = s1.append("g").attr("transform", "translate(0,800)").call(d3.axisBottom(x_scale).ticks(5));


var previous_b = null;
var brush_1 = s1.append("g")
    .attr("class", "brush")
    .call(d3.brush()
        .on("start", start)
        .on("brush end", brushed))
    .on("click", click);

function incircle(p, c) {
    if (Math.pow(p[0] - c[0], 2) + Math.pow(p[1] - c[1], 2) <= 25) {
        return true;
    } else {
        return false;
    }
}

function click(d) {
    d = d3.mouse(this);
    enter_s1.classed("selected", d && function(e) {
        c = [x_scale(e.X), y_scale(e.Y)];
        return incircle(d, c);
    });
    var sel = s1.selectAll(".selected").data();
    d3.select("#values").remove();
    var tb = d3.select("#main_div").append("div").attr("id", "values").selectAll("table").data(sel).enter().append("table")
    var td = tb.append("tr").append("td")
    td.append("span").text(function(d) {
        return d.Sentence1;
    })
    td.append("span").attr("style","color:red").text(function(d) {
        return " "+d.query+" ";
    })
    td.append("span").text(function(d) {
        return d.Sentence2;
    })
}

function start() {
    if (previous_b != null) {
        d3.select(previous_b).select(".selection").style("display", "none");
    }
    previous_b = this;
}

function brushed() {
    var selection = d3.event.selection;
    enter_s1.classed("selected", selection && function(d) {
        return selection[0][0] <= x_scale(d.SATM) && x_scale(d.SATM) <= selection[1][0] &&
            selection[0][1] <= y_scale(d.SATV) && y_scale(d.SATV) <= selection[1][1];
    });
    d3.select("#values").remove();
}