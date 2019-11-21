// var scores_cf = crossfilter(scores);

// var x_d = scores_cf.dimension(function(d) { return d.X; });
// var y_d = scores_cf.dimension(function(d) { return d.Y; });
// var x2_d = scores_cf.dimension(function(d) { return d.X2; });
// var y2_d = scores_cf.dimension(function(d) { return d.Y2; });
// var entailment_d = scores_cf.dimension(function(d) { return d.entailment; });
// var prediction_d = scores_cf.dimension(function(d) { return d.prediction; });

var seed = 1;
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

function getPoints(x, sent) {
  return sent.Sentence == x;
}

scores_sample = getRandomSubarray(scores, 1000);

var x_scale = d3.scaleLinear().domain([x0-2, x1+2]).range([25, 475]);
var y_scale = d3.scaleLinear().domain([y0-2, y1+2]).range([475, 25]);

div1 = d3.select("#main_div").append("div").attr("class","plot");
div2 = d3.select("#main_div").append("div").attr("class","plot");


var s1 = div1.append("svg").attr("id", "scatterplot_1").attr("height", 500).attr("width", 500);
var enter_s1 = s1.append("g").attr("class", "node").selectAll("circle").data(scores_sample).enter().append("circle").each(function(d) { d.svgElement = this; });
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
function predictionColor(d){
    return colorScale(d.prediction);
};

enter_s1.attr('stroke', entailmentColor);

var g_y = s1.append("g").attr("transform", "translate(25,0)").call(d3.axisLeft(y_scale).ticks(5));
var g_x = s1.append("g").attr("transform", "translate(0,475)").call(d3.axisBottom(x_scale).ticks(5));

var x_scale_2 = d3.scaleLinear().domain([x02-2, x12+2]).range([25, 475]);
var y_scale_2 = d3.scaleLinear().domain([y02-2, y12+2]).range([475, 25]);

var s2 = div2.append("svg").attr("id", "scatterplot_2").attr("height", 500).attr("width", 500);
var enter_s2 = s2.append("g").attr("class", "node").selectAll("circle").data(scores_sample).enter().append("circle").each(function(d) { d.svgElement2 = this; });
enter_s2.attr("cx", function(d) {
    return x_scale_2(d.X2);
});
enter_s2.attr("cy", function(d) {
    return y_scale_2(d.Y2);
});
enter_s2.attr("r", 3);

enter_s2.attr("stroke-width","3")

enter_s2.attr('stroke', entailmentColor);
enter_s2.attr("fill", "grey");

var g_y = s2.append("g").attr("transform", "translate(25,0)").call(d3.axisLeft(y_scale_2).ticks(5));
var g_x = s2.append("g").attr("transform", "translate(0,475)").call(d3.axisBottom(x_scale_2).ticks(9));

show_TableAndSentence(enter_s2.data());

function show_TableAndSentence(sel){
    var sum_n_n = 0
    var sum_n_e = 0
    var sum_n_c = 0
    var sum_c_c = 0
    var sum_c_n = 0
    var sum_c_e = 0
    var sum_e_e = 0
    var sum_e_c = 0
    var sum_e_n = 0
    for (var i = sel.length - 1; i >= 0; i--) {
        switch(sel[i].prediction) {
          case 1:
            switch(sel[i].entailment){
                case 1:
                    sum_n_n += 1
                    break;
                case 2:
                    sum_n_c += 1
                    break;
                case 3:
                    sum_n_e += 1
                    break;
                default:
            }
            break;
          case 2:
            switch(sel[i].entailment){
                case 1:
                    sum_c_n += 1
                    break;
                case 2:
                    sum_c_c += 1
                    break;
                case 3:
                    sum_c_e += 1
                    break;
                default:
            }
            break;
          case 3:
            switch(sel[i].entailment){
                case 1:
                    sum_e_n += 1
                    break;
                case 2:
                    sum_e_c += 1
                    break;
                case 3:
                    sum_e_e += 1
                    break;
                default:
            }
            break;
          default:
            // code block
        }
    }
    var namelist = ["pred/entail", "neutral", "contradiction", "entailment"]
    var nlist = ["neutral", sum_n_n, sum_n_c, sum_n_e]
    var clist = ["contradiction", sum_c_n, sum_c_c, sum_c_e]
    var elist = ["entailment", sum_e_n, sum_e_c, sum_e_e]
    d3.select("#counts").remove();
    var tb = d3.select("#main_div").append("div").attr("id", "counts").append("table")
    tb.append("tr").selectAll("th").data(namelist).enter().append("th").text(function(d){ return d });
    tb.append("tr").selectAll("td").data(nlist).enter().append("td").text(function(d){ return d });
    tb.append("tr").selectAll("td").data(clist).enter().append("td").text(function(d){ return d });
    tb.append("tr").selectAll("td").data(elist).enter().append("td").text(function(d){ return d });

    if (sel.length < 100) {
        d3.select("#values").remove();
        d3.selectAll("#np").remove();
        var tb = d3.select("#main_div").append("div").attr("id", "values").append("table")
        var td = tb.selectAll("tr").data(sel).enter().append("tr").on("click", function(d){
            d3.selectAll("#np").remove();
            var enter_s1 = s1.append("g").attr("id", "np").selectAll("circle").data(scores.filter(getPoints.bind(this, d.Sentence))).enter().append("circle");
            enter_s1.attr("cx", function(d) {
                return x_scale(d.X);
            });
            enter_s1.attr("cy", function(d) {
                return y_scale(d.Y);
            });
            enter_s1.attr("r", 9);
            enter_s1.attr("fill", "white");
            enter_s1.attr("stroke", "black");
            enter_s1.on("mouseover", function(d){
                s1.append("text")
                .attr("id","word")
                .attr("x", x_scale(d.X))
                .attr("y", y_scale(d.Y))
                .attr("dx", "6") // margin
                .attr("dy", ".35em") // vertical-align
                .text(sentences[d.Sentence][d.pos].replace("QUERY", ""));
            });
            enter_s1.on("mouseleave", function(d){
                d3.select("#word").remove();
            });
            var enter_s2 = s2.append("g").attr("id", "np").selectAll("circle").data(scores.filter(getPoints.bind(this, d.Sentence))).enter().append("circle");
            enter_s2.attr("cx", function(d) {
                return x_scale_2(d.X2);
            });
            enter_s2.attr("cy", function(d) {
                return y_scale_2(d.Y2);
            });
            enter_s2.attr("r", 9);
            enter_s2.attr("fill", "white");
            enter_s2.attr("stroke", "black");
            enter_s2.on("mouseover", function(d){
                s2.append("text")
                .attr("id","word")
                .attr("x", x_scale_2(d.X2))
                .attr("y", y_scale_2(d.Y2))
                .attr("dx", "6") // margin
                .attr("dy", ".35em") // vertical-align
                .text(sentences[d.Sentence][d.pos].replace("QUERY", ""));
            });
            enter_s2.on("mouseleave", function(d){
                d3.select("#word").remove();
            });
         }).append("td").attr("id", function(d) { return d.pos; });
        td.selectAll("span").data(function(d){
            var s = sentences[d.Sentence];
            // s[d.pos] = 'QUERY' + s[d.pos];

            return s.map(function(word, i) {
                return {
                    word: word,
                    pos: i,
                    selectedPos: d.pos
                };
            });
        }).enter().append("span").text(function(d){
            return d.word + " ";
            /*if (d != '[CLS]' && d != '[SEP]')
                return d.replace('QUERY', '') + ' ';*/
         }).attr('style', function(d, i){
            if (d.pos === d.selectedPos)
            //if (d.includes('QUERY'))
                return 'color:red'
         });
    }
}

var previous_b = null;
var brush_1 = s1.append("g")
    .attr("class", "brush")
    .attr("pointer-events", "all")
    .call(d3.brush()
        .on("start", start)
        .on("brush end", brushed))
    .on("click", click)
    .call(d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoom));;

function incircle(p, c) {
    if (Math.pow(p[0] - c[0], 2) + Math.pow(p[1] - c[1], 2) <= 25) {
        return true;
    } else {
        return false;
    }
}

function click(d) {
    d3.selectAll("#np").remove();
    d = d3.mouse(this);
    enter_s1.classed("selected", d && function(e) {
        c = [x_scale(e.X), y_scale(e.Y)];
        return incircle(d, c);
    });
    enter_s2.classed("selected", d && function(e) {
        c = [x_scale(e.X), y_scale(e.Y)];
        return incircle(d, c);
    });
    if (d3.selectAll(".selected").size() != 0){
        enter_s1.classed("unselected", d && function(e) {
            c = [x_scale(e.X), y_scale(e.Y)];
            return !incircle(d, c);
        });
        enter_s2.classed("unselected", d && function(e) {
            c = [x_scale(e.X), y_scale(e.Y)];
            return !incircle(d, c);
        });
        show_TableAndSentence(s1.selectAll(".selected").data());
    }else
        show_TableAndSentence(enter_s1.data());
}

function start() {
    if (previous_b != null) {
        d3.select(previous_b).select(".selection").style("display", "none");
    }
    previous_b = this;
}

function brushed() {
    var selection = d3.event.selection;
    // x_d.filter([x_scale.invert(selection[0][0]), x_scale.invert(selection[1][0])]);
    // y_d.filter([y_scale.invert(selection[0][1]), y_scale.invert(selection[1][1])]);
    // x_d.top(Infinity).forEach(d => d3.select(d.svgElement).attr("fill", "red"));
    // x_d.top(Infinity).forEach(d => d3.select(d.svgElement2).attr("fill", "red"));
    enter_s1.classed("selected", selection && function(d) {
        return selection[0][0] <= x_scale(d.X) && x_scale(d.X) <= selection[1][0] &&
            selection[0][1] <= y_scale(d.Y) && y_scale(d.Y) <= selection[1][1];
    });
    enter_s1.classed("unselected", selection && function(d) {
        return !(selection[0][0] <= x_scale(d.X) && x_scale(d.X) <= selection[1][0] &&
            selection[0][1] <= y_scale(d.Y) && y_scale(d.Y) <= selection[1][1]);
    })
    enter_s2.classed("selected", selection && function(d) {
        return selection[0][0] <= x_scale(d.X) && x_scale(d.X) <= selection[1][0] &&
            selection[0][1] <= y_scale(d.Y) && y_scale(d.Y) <= selection[1][1];
    });
    enter_s2.classed("unselected", selection && function(d) {
        return !(selection[0][0] <= x_scale(d.X) && x_scale(d.X) <= selection[1][0] &&
            selection[0][1] <= y_scale(d.Y) && y_scale(d.Y) <= selection[1][1]);
    });
    d3.select("#values").remove();

    show_TableAndSentence(s1.selectAll(".selected").data());    
}

var brush_2 = s2.append("g")
    .attr("class", "brush")
    .call(d3.brush()
        .on("start", start)
        .on("brush end", brushed_2))
    .on("click", click_2);

function click_2(d) {
    d3.selectAll("#np").remove();
    d = d3.mouse(this);
    enter_s1.classed("selected", d && function(e) {
        c = [x_scale_2(e.X2), y_scale_2(e.Y2)];
        return incircle(d, c);
    });
    enter_s2.classed("selected", d && function(e) {
        c = [x_scale_2(e.X2), y_scale(e.Y2)];
        return incircle(d, c);
    });
    if (d3.selectAll(".selected").size() != 0){
        enter_s1.classed("unselected", d && function(e) {
            c = [x_scale_2(e.X2), y_scale_2(e.Y2)];
            return !incircle(d, c);
        });
        enter_s2.classed("unselected", d && function(e) {
            c = [x_scale_2(e.X2), y_scale_2(e.Y2)];
            return !incircle(d, c);
        });
        show_TableAndSentence(s2.selectAll(".selected").data());
    }else
        show_TableAndSentence(enter_s2.data());
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
    enter_s2.classed("unselected", selection && function(d) {
        return !(selection[0][0] <= x_scale_2(d.X2) && x_scale_2(d.X2) <= selection[1][0] &&
            selection[0][1] <= y_scale_2(d.Y2) && y_scale_2(d.Y2) <= selection[1][1]);
    });
    enter_s1.classed("unselected", selection && function(d) {
        return !(selection[0][0] <= x_scale_2(d.X2) && x_scale_2(d.X2) <= selection[1][0] &&
            selection[0][1] <= y_scale_2(d.Y2) && y_scale_2(d.Y2) <= selection[1][1]);
    });    
    d3.select("#values").remove();

    show_TableAndSentence(s2.selectAll(".selected").data()); 
}

var buttonList = [
    {
        name: "button1",
        text: "Entailment",
        click: function() { 
            enter_s2.transition().duration(1000).attr("stroke", entailmentColor); 
        }
    },
    {
        name: "button2",
        text: "Prediction",
        click: function() { 
            enter_s2.transition().duration(1000).attr("stroke", predictionColor); 
        }
    },
    {
        name: "button3",
        text: "Accuracy",
        click: function() { 
            enter_s2.transition().duration(1000).attr("stroke", function(d){
                if (d.prediction === d.entailment){
                    return 'green'
                }else{
                    return 'red'
                }
            });
        }
    }
];

div2.selectAll("button")
    .data(buttonList)
    .enter()
    .append("button")
    .attr("id", function(d) { return d.name; })
    .text(function(d) { return d.text; })
    .on("click", function(d) {
        return d.click();
    });

function zoom() {
  enter_s1.attr("transform", transform(d3.event.transform));
}

function transform(t) {
  return function(d) {
    return "translate(" + t.apply([x_scale(d.X), y_scale(d.Y)]) + ")";
  };
}