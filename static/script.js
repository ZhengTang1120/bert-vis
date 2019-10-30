
var x_scale = d3.scaleLinear().domain([x0-2, x1+2]).range([25, 475]);
var y_scale = d3.scaleLinear().domain([y0-2, y1+2]).range([475, 25]);

div = d3.select("#main_div").append("div");


var s1 = div.append("svg").attr("id", "scatterplot_1").attr("height", 500).attr("width", 500);
var enter_s1 = s1.append("g").attr("class", "node").selectAll("circle").data(scores).enter().append("circle");
enter_s1.attr("cx", function(d) {
    return x_scale(d.X);
});
enter_s1.attr("cy", function(d) {
    return y_scale(d.Y);
});
enter_s1.attr("r", 3);
enter_s1.attr("fill", "grey");
enter_s1.attr("stroke-width","3");

colorScale = d3.scaleOrdinal(d3.schemeCategory10);
colorScale(1);
colorScale(2);
colorScale(3);
function entailmentColor(d){
    return colorScale(d.entailment);
};

enter_s1.attr('stroke', entailmentColor);

var g_y = s1.append("g").attr("transform", "translate(25,0)").call(d3.axisLeft(y_scale).ticks(5));
var g_x = s1.append("g").attr("transform", "translate(0,475)").call(d3.axisBottom(x_scale).ticks(5));

var x_scale_2 = d3.scaleLinear().domain([x02-2, x12+2]).range([25, 475]);
var y_scale_2 = d3.scaleLinear().domain([y02-2, y12+2]).range([475, 25]);

var s2 = div.append("svg").attr("id", "scatterplot_2").attr("height", 500).attr("width", 500);
var enter_s2 = s2.append("g").attr("class", "node").selectAll("circle").data(scores).enter().append("circle");
enter_s2.attr("cx", function(d) {
    return x_scale_2(d.X2);
});
enter_s2.attr("cy", function(d) {
    return y_scale_2(d.Y2);
});
enter_s2.attr("r", 3);


enter_s2.attr("fill", function(d){
    if (d.prediction === d.entailment){
        return 'white'
    }else{
        return 'black'
    }
});

enter_s2.attr("stroke-width","3")

enter_s2.attr('stroke', entailmentColor);

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
    d3.select("#counts").remove();
    var tb = d3.select("#main_div").append("div").attr("id", "values").append("table")
    var td = tb.selectAll("tr").data(sel).enter().append("tr").append("td").attr("id", function(d) { return d.pos; });
    td.selectAll("span").data(function(d){
        return d.sent
    }).enter().append("span").text(function(d){
        if (d != '[CLS]' && d != '[SEP]')
            return d.replace('QUERY', '') + ' ';
     }).attr('style', function(d, i){
        if (d.includes('QUERY'))
            return 'color:red'
     });
    // td.append("span").text(function(d) {
    //     return d.Sentence1;
    // })
    // td.append("span").attr("style","color:red").text(function(d) {
    //     return " "+d.query+" ";
    // })
    // td.append("span").text(function(d) {
    //     return d.Sentence2;
    // })
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
    d3.select("#counts").remove();
    d3.selectAll("#np").remove();
    var tb = d3.select("#main_div").append("div").attr("id", "values").append("table")
    var td = tb.selectAll("tr").data(sel).enter().append("tr").on("click", function(d){
        d3.selectAll("#np").remove();
        var enter_s1 = s1.append("g").attr("id", "np").selectAll("circle").data(d.np).enter().append("circle");
        enter_s1.attr("cx", function(d) {
            return x_scale(d[0]);
        });
        enter_s1.attr("cy", function(d) {
            return y_scale(d[1]);
        });
        enter_s1.attr("r", 9);
        enter_s1.attr("fill", "red");
        var enter_s2 = s2.append("g").attr("id", "np").selectAll("circle").data(d.np).enter().append("circle");
        enter_s2.attr("cx", function(d) {
            return x_scale_2(d[2]);
        });
        enter_s2.attr("cy", function(d) {
            return y_scale_2(d[3]);
        });
        enter_s2.attr("r", 9);
        enter_s2.attr("fill", "red");
     }).append("td").attr("id", function(d) { return d.pos; });
    td.selectAll("span").data(function(d){
        return d.sent
    }).enter().append("span").text(function(d){
        if (d != '[CLS]' && d != '[SEP]')
            return d.replace('QUERY', '') + ' ';
     }).attr('style', function(d, i){
        if (d.includes('QUERY'))
            return 'color:red'
     })
    // td.append("span").text(function(d) {
    //     return d.Sentence1;
    // })
    // td.append("span").attr("style","color:red").text(function(d) {
    //     return " "+d.query+" ";
    // })
    // td.append("span").text(function(d) {
    //     return d.Sentence2;
    // })
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
    var sel = s2.selectAll(".selected").data();
    var sum_n_1 = 0
    var sum_p_1 = 0
    var sum_n_2 = 0
    var sum_p_2 = 0
    var sum_n_3 = 0
    var sum_p_3 = 0
    for (var i = sel.length - 1; i >= 0; i--) {
        switch(sel[i].prediction) {
          case 1:
            if (sel[i].prediction === sel[i].entailment){
                sum_p_1 += 1
            }else{
                sum_n_1 += 1
            }
            break;
          case 2:
            if (sel[i].prediction === sel[i].entailment){
                sum_p_2 += 1
            }else{
                sum_n_2 += 1
            }
            break;
          case 3:
            if (sel[i].prediction === sel[i].entailment){
                sum_p_3 += 1
            }else{
                sum_n_3 += 1
            }
            break;
          default:
            // code block
        }
    }
    d3.select("#counts").remove();
    var tb = d3.select("#main_div").append("div").attr("id", "counts").append("table")
    var td = tb.append("tr").append("td")
    td.append("tr").text(function(d) {
        return 'True Neutral: ' + sum_p_1;
    })
    td.append("tr").text(function(d) {
        return 'False Neutral: ' + sum_n_1;
    })
    td.append("tr").text(function(d) {
        return 'True Contradiction: ' + sum_p_2;
    })
    td.append("tr").text(function(d) {
        return 'False Contradiction: ' + sum_n_2;
    })
    td.append("tr").text(function(d) {
        return 'True Entailment: ' + sum_p_3;
    })
    td.append("tr").text(function(d) {
        return 'False Entailment: ' + sum_n_3;
    })
    d3.select("#values").remove();
}