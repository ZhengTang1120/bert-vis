var x_scale = d3.scaleLinear().domain([x0, x1]).range([25, 475]);
var y_scale = d3.scaleLinear().domain([y0, y1]).range([475, 25]);

div = d3.select("#main_div").append("div");

var s1 = div.append("svg").attr("id", "scatterplot_1").attr("height", 500).attr("width", 500);
var enter_s1 = s1.append("g").attr("class", "node").selectAll("circle").data(scores).enter().append("circle");
enter_s1.attr("cx", function(d) {
    return x_scale(d.X);
});
enter_s1.attr("cy", function(d) {
    return y_scale(d.Y);
});
enter_s1.attr("r", 4);
enter_s1.attr("fill", "grey");

var g_y = s1.append("g").attr("transform", "translate(25,0)").call(d3.axisLeft(y_scale).ticks(5));
var g_x = s1.append("g").attr("transform", "translate(0,475)").call(d3.axisBottom(x_scale).ticks(5));

var x_scale_2 = d3.scaleLinear().domain([x02, x12]).range([25, 475]);
var y_scale_2 = d3.scaleLinear().domain([y02, y12]).range([475, 25]);

var s2 = div.append("svg").attr("id", "scatterplot_2").attr("height", 500).attr("width", 500);
var enter_s2 = s2.append("g").attr("class", "node").selectAll("circle").data(scores).enter().append("circle");
enter_s2.attr("cx", function(d) {
    return x_scale_2(d.X2);
});
enter_s2.attr("cy", function(d) {
    return y_scale_2(d.Y2);
});
enter_s2.attr("r", 4);
enter_s2.attr("fill", "grey");

var g_y = s2.append("g").attr("transform", "translate(25,0)").call(d3.axisLeft(y_scale_2).ticks(5));
var g_x = s2.append("g").attr("transform", "translate(0,475)").call(d3.axisBottom(x_scale_2).ticks(9));

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
    enter_s2.classed("selected", d && function(e) {
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
        return selection[0][0] <= x_scale(d.X) && x_scale(d.X) <= selection[1][0] &&
            selection[0][1] <= y_scale(d.Y) && y_scale(d.Y) <= selection[1][1];
    });
    enter_s2.classed("selected", selection && function(d) {
        return selection[0][0] <= x_scale(d.X) && x_scale(d.X) <= selection[1][0] &&
            selection[0][1] <= y_scale(d.Y) && y_scale(d.Y) <= selection[1][1];
    });
    d3.select("#values").remove();
}

var brush_2 = s2.append("g")
    .attr("class", "brush")
    .call(d3.brush()
        .on("start", start)
        .on("brush end", brushed_2))
    .on("click", click_2);

function click_2(d) {
    d = d3.mouse(this);
    enter_s1.classed("selected", d && function(e) {
        c = [x_scale_2(e.X2), y_scale_2(e.Y2)];
        return incircle(d, c);
    });
    enter_s2.classed("selected", d && function(e) {
        c = [x_scale_2(e.X2), y_scale_2(e.Y2)];
        return incircle(d, c);
    });
    var sel = s2.selectAll(".selected").data();
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

function brushed_2() {
    var selection = d3.event.selection;
    enter_s2.classed("selected", selection && function(d) {
        return selection[0][0] <= x_scale_2(d.X2) && x_scale_2(d.X2) <= selection[1][0] &&
            selection[0][1] <= y_scale_2(d.Y2) && y_scale_2(d.Y2) <= selection[1][1];
    });
    enter_s1.classed("selected", selection && function(d) {
        return selection[0][0] <= x_scale_2(d.X2) && x_scale_2(d.X2) <= selection[1][0] &&
            selection[0][1] <= y_scale_2(d.Y2) && y_scale_2(d.Y2) <= selection[1][1];
    });
    d3.select("#values").remove();
}