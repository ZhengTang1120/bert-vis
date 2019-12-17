var search = d3.select("#main_div").append("div");

labels = ["-", "neutral", "contradiction", "entailment"]
var zoomer  = null;
var zoomer2 = null;
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

scores_sample = getRandomSubarray(scores, 5000);

var x_scale = d3.scaleLinear().domain([x0-2, x1+2]).range([25, 475]);
var y_scale = d3.scaleLinear().domain([y0-2, y1+2]).range([475, 25]);

div1 = d3.select("#main_div").append("div").attr("class","plot");
div2 = d3.select("#main_div").append("div").attr("class","plot");


var s1 = div1.append("svg").attr("id", "scatterplot_1").attr("height", 500).attr("width", 500);
var enter_s1 = s1.append("g").attr("class", "node").selectAll("circle").data(scores_sample).enter().append("circle").each(function(d) { d.svgElement = this; });
enter_s1.attr("r", 3);
enter_s1.attr("stroke-width","2");
enter_s1.attr("transform", transform(d3.zoomIdentity));

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

enter_s1.attr("fill", entailmentColor);
// enter_s1.attr('stroke', entailmentColor);

var g_y = s1.append("g").attr("transform", "translate(25,0)").call(d3.axisLeft(y_scale).ticks(5));
var g_x = s1.append("g").attr("transform", "translate(0,475)").call(d3.axisBottom(x_scale).ticks(5));

var x_scale_2 = d3.scaleLinear().domain([x02-2, x12+2]).range([25, 475]);
var y_scale_2 = d3.scaleLinear().domain([y02-2, y12+2]).range([475, 25]);

var s2 = div2.append("svg").attr("id", "scatterplot_2").attr("height", 500).attr("width", 500);
var enter_s2 = s2.append("g").attr("class", "node").selectAll("circle").data(scores_sample).enter().append("circle").each(function(d) { d.svgElement2 = this; });
enter_s2.attr("r", 3);

enter_s2.attr("stroke-width","2")

// enter_s2.attr('stroke', entailmentColor);
enter_s2.attr("fill", entailmentColor);

enter_s2.attr("transform", transform2(d3.zoomIdentity));

var g_y = s2.append("g").attr("transform", "translate(25,0)").call(d3.axisLeft(y_scale_2).ticks(5));
var g_x = s2.append("g").attr("transform", "translate(0,475)").call(d3.axisBottom(x_scale_2).ticks(9));

show_TableAndSentence(scores_sample);

var form = search.append("form");
form.append("input").attr("id", "search");

search.append("button").text('search').on("click", function(){
    var search = d3.select("#search").node().value;
    enter_s1.classed("selected", search && function(d) {
        return search == sentences[d.Sentence][d.pos];
    });
    enter_s1.classed("unselected", search && function(d) {
        return search != sentences[d.Sentence][d.pos];
    });
    enter_s2.classed("selected", search && function(d) {
        return search == sentences[d.Sentence][d.pos];
    });
    enter_s2.classed("unselected", search && function(d) {
        return search != sentences[d.Sentence][d.pos];
    });
    show_TableAndSentence(s1.selectAll(".selected").data());
});

function renderSentences(sel){
    if (sel.length > 10)
        sel = getRandomSubarray(sel, 10)
    sel = sel.sort(function(x, y){
       return d3.ascending(x.entailment, y.entailment);
    });
    d3.select("#values").remove();
    d3.selectAll("#np").remove();
    var values = d3.select("#main_div").append("div").attr("id", "values");
    values.attr("style", "height:400px; overflow:auto");
    var buttonList = [
        {
            name: "button1",
            text: "Entailment",
            click: function() { 
                tr.transition().duration(1000).style("background-color", entailmentColor); 
            }
        },
        {
            name: "button2",
            text: "Prediction",
            click: function() { 
                tr.transition().duration(1000).style("background-color", predictionColor); 
            }
        },
        {
            name: "button3",
            text: "Accuracy",
            click: function() { 
                tr.transition().duration(1000).style("background-color", function(d){
                    if (d.prediction === d.entailment){
                        return 'green'
                    }else{
                        return 'red'
                    }
                });
            }
        }
    ];

    values.selectAll("button")
        .data(buttonList)
        .enter()
        .append("button")
        .attr("id", function(d) { return d.name; })
        .text(function(d) { return d.text; })
        .on("click", function(d) {
            return d.click();
        });
    var tb = values.append("table")
    var clicked = false;
    var tr = tb.selectAll("tr").data(sel).enter().append("tr").style('background-color', entailmentColor).on("click", function(d){
        d3.selectAll("#np").remove();
        if (!clicked){
            var enter_s1 = s1.append("g").attr("id", "np").selectAll("circle").data(scores.filter(getPoints.bind(this, d.Sentence))).enter().append("circle").attr("class", "np1");
            enter_s1.attr("transform", transform(d3.zoomIdentity))
            enter_s1.attr("r", 9);
            enter_s1.attr("fill", function(d){
                if (d.pos <= sentences[d.Sentence].indexOf('[SEP]'))
                    return "black";
                else
                    return "white";
            });
            enter_s1.attr("stroke", "black");
            enter_s1.on("mouseover", function(d){
                s1.append("text")
                .attr("id","word")
                .attr("x", zoomer.applyX(x_scale(d.X)))
                .attr("y", zoomer.applyY(y_scale(d.Y)))
                .attr("dx", "6") // margin
                .attr("dy", ".35em") // vertical-align
                .text(sentences[d.Sentence][d.pos].replace("QUERY", ""));
            });
            enter_s1.on("mouseleave", function(d){
                d3.select("#word").remove();
            });
            var enter_s2 = s2.append("g").attr("id", "np").selectAll("circle").data(scores.filter(getPoints.bind(this, d.Sentence))).enter().append("circle").attr("class", "np2");
            enter_s2.attr("transform", transform2(d3.zoomIdentity))
            enter_s2.attr("r", 9);
            enter_s2.attr("fill", function(d){
                if (d.pos <= sentences[d.Sentence].indexOf('[SEP]'))
                    return "black";
                else
                    return "white";
            });
            enter_s2.attr("stroke", "black");
            enter_s2.on("mouseover", function(d){
                s2.append("text")
                .attr("id","word")
                .attr("x", zoomer2.applyX(x_scale_2(d.X2)))
                .attr("y", zoomer2.applyY(y_scale_2(d.Y2)))
                .attr("dx", "6") // margin
                .attr("dy", ".35em") // vertical-align
                .text(sentences[d.Sentence][d.pos].replace("QUERY", ""));
            });
            enter_s2.on("mouseleave", function(d){
                d3.select("#word").remove();
            });
            clicked = true;
        }else
            clicked = false;
     });

    var td = tr.append("td").attr("id", function(d) { return d.pos; });
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

function selectNode(d){
    enter_s1.classed("selected", d && function(e){ return d.includes(e) });
    enter_s1.classed("unselected", d && function(e){ return !d.includes(e) });
    enter_s2.classed("selected", d && function(e){ return d.includes(e) });
    enter_s2.classed("unselected", d && function(e){ return !d.includes(e) });
}

function show_TableAndSentence(sel){
    d3.selectAll("#classed_node").remove();
    d3.selectAll("#values").remove();
    d3.selectAll("#np").remove();
    var sum_n_n = []
    var sum_n_e = []
    var sum_n_c = []
    var sum_c_c = []
    var sum_c_n = []
    var sum_c_e = []
    var sum_e_e = []
    var sum_e_c = []
    var sum_e_n = []
    for (var i = sel.length - 1; i >= 0; i--) {
        switch(sel[i].prediction) {
          case 1:
            switch(sel[i].entailment){
                case 1:
                    sum_n_n.push(sel[i])
                    break;
                case 2:
                    sum_n_c.push(sel[i])
                    break;
                case 3:
                    sum_n_e.push(sel[i])
                    break;
                default:
            }
            break;
          case 2:
            switch(sel[i].entailment){
                case 1:
                    sum_c_n.push(sel[i])
                    break;
                case 2:
                    sum_c_c.push(sel[i])
                    break;
                case 3:
                    sum_c_e.push(sel[i])
                    break;
                default:
            }
            break;
          case 3:
            switch(sel[i].entailment){
                case 1:
                    sum_e_n.push(sel[i])
                    break;
                case 2:
                    sum_e_c.push(sel[i])
                    break;
                case 3:
                    sum_e_e.push(sel[i])
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
    tb.append("tr").selectAll("th").data(namelist).enter().append("th").text(function(d){ return d }).on("click", function(d, i){
        switch(i){
            case 1:
                selectNode([...sum_c_n,...sum_e_n,...sum_n_n]);
                renderSentences(s1.selectAll(".selected").data());
            break;
            case 2:
                selectNode([...sum_n_c,...sum_c_c,...sum_e_c]);
                renderSentences(s1.selectAll(".selected").data());
            break;
            case 3:
                selectNode([...sum_n_e,...sum_c_e,...sum_e_e]);
                renderSentences(s1.selectAll(".selected").data());
            break;
            case 0:
                enter_s1.attr("class", "true");
                enter_s2.attr("class", "true");
                show_TableAndSentence(enter_s1.data());
                break;
        }
    });
    tb.append("tr").selectAll("td").data(nlist).enter().append("td")
        .text(function(d, i){ 
            if (i!=0) 
                return d.length 
            else 
                return d })
        .on("click", function(d, i){
            switch(i){
                case 0:
                    selectNode([...sum_n_n,...sum_n_c,...sum_n_e]);
                    break;
                default:
                    selectNode(d);
            }
            renderSentences(s1.selectAll(".selected").data());
        });
    tb.append("tr").selectAll("td").data(clist).enter().append("td")
        .text(function(d, i){ 
            if (i!=0) 
                return d.length 
            else 
                return d })
        .on("click", function(d, i){
            switch(i){
                case 0:
                    selectNode([...sum_c_n,...sum_c_c,...sum_c_e]);
                    break;
                default:
                    selectNode(d);
            }
            renderSentences(s1.selectAll(".selected").data());
        });
    tb.append("tr").selectAll("td").data(elist).enter().append("td")
        .text(function(d, i){ 
            if (i!=0) 
                return d.length 
            else 
                return d })
        .on("click", function(d, i){
            switch(i){
                case 0:
                    selectNode([...sum_e_n,...sum_e_c,...sum_e_e]);
                    break;
                default:
                    selectNode(d);
            }
            renderSentences(s1.selectAll(".selected").data());
        });
    renderSentences(sel);
}

var brushEnable = true;
var previous_b = null;
var brush_1 = s1.append("g")
    .attr("class", "brush")
    .attr("pointer-events", "all")
    .on("click", click)
    .call(d3.brush()
        .on("start", start)
        .on("brush end", brushed));

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
        c = zoomer.apply([x_scale(e.X), y_scale(e.Y)]);
        return incircle(d, c);
    });
    enter_s2.classed("selected", d && function(e) {
        c = zoomer.apply([x_scale(e.X), y_scale(e.Y)]);
        return incircle(d, c);
    });
    if (d3.selectAll(".selected").size() != 0){
        enter_s1.classed("unselected", d && function(e) {
            c = zoomer.apply([x_scale(e.X), y_scale(e.Y)]);
            return !incircle(d, c);
        });
        enter_s2.classed("unselected", d && function(e) {
            c = zoomer.apply([x_scale(e.X), y_scale(e.Y)]);
            return !incircle(d, c);
        });
        show_TableAndSentence(s1.selectAll(".selected").data());
    }else{
        enter_s1.attr("class", "true");
        enter_s2.attr("class", "true");
        show_TableAndSentence(enter_s1.data());
    }
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
        return selection[0][0] <= zoomer.applyX(x_scale(d.X)) && zoomer.applyX(x_scale(d.X)) <= selection[1][0] &&
            selection[0][1] <= zoomer.applyY(y_scale(d.Y)) && zoomer.applyY(y_scale(d.Y)) <= selection[1][1];
    });
    var d = s1.selectAll(".selected").data();
    enter_s1.classed("selected", d && function(e){ return d.includes(e) });
    enter_s2.classed("selected", d && function(e){ return d.includes(e) });
    enter_s1.classed("unselected", d && function(e){ return !d.includes(e) });
    enter_s2.classed("unselected", d && function(e){ return !d.includes(e) });
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
    d = d3.mouse(this);
    enter_s2.classed("selected", d && function(e) {
        c = zoomer2.apply([x_scale_2(e.X2), y_scale_2(e.Y2)]);
        return incircle(d, c);
    });
    enter_s1.classed("selected", d && function(e) {
        c = zoomer2.apply([x_scale_2(e.X2), y_scale(e.Y2)]);
        return incircle(d, c);
    });
    if (d3.selectAll(".selected").size() != 0){
        enter_s1.classed("unselected", d && function(e) {
            c = zoomer2.apply([x_scale_2(e.X2), y_scale_2(e.Y2)]);
            return !incircle(d, c);
        });
        enter_s2.classed("unselected", d && function(e) {
            c = zoomer2.apply([x_scale_2(e.X2), y_scale_2(e.Y2)]);
            return !incircle(d, c);
        });
        show_TableAndSentence(s2.selectAll(".selected").data());
    }else{
        enter_s1.attr("class", "true");
        enter_s2.attr("class", "true");
        show_TableAndSentence(enter_s2.data());
    }
}

function brushed_2() {
    var selection = d3.event.selection;
    enter_s2.classed("selected", selection && function(d) {
        return selection[0][0] <= zoomer2.applyX(x_scale_2(d.X2)) && zoomer2.applyX(x_scale_2(d.X2)) <= selection[1][0] &&
            selection[0][1] <= zoomer2.applyY(y_scale_2(d.Y2)) && zoomer2.applyY(y_scale_2(d.Y2)) <= selection[1][1];
    });
    var d = s2.selectAll(".selected").data();
    enter_s1.classed("selected", d && function(e){ return d.includes(e) });
    enter_s1.classed("unselected", d && function(e){ return !d.includes(e) });
    enter_s2.classed("selected", d && function(e){ return d.includes(e) });
    enter_s2.classed("unselected", d && function(e){ return !d.includes(e) });
    d3.select("#values").remove();

    show_TableAndSentence(s2.selectAll(".selected").data()); 
}

var buttonList = [
    {
        name: "button1",
        text: "Entailment",
        click: function() { 
            // enter_s2.transition().duration(1000).attr("stroke", entailmentColor); 
            enter_s2.transition().duration(1000).attr("fill", entailmentColor); 
        }
    },
    {
        name: "button2",
        text: "Prediction",
        click: function() { 
            // enter_s2.transition().duration(1000).attr("stroke", predictionColor); 
            enter_s2.transition().duration(1000).attr("fill", predictionColor); 
        }
    },
    {
        name: "button3",
        text: "Accuracy",
        click: function() { 
            // enter_s2.transition().duration(1000).attr("stroke", function(d){
            //     if (d.prediction === d.entailment){
            //         return 'green'
            //     }else{
            //         return 'red'
            //     }
            // });
            enter_s2.transition().duration(1000).attr("fill", function(d){
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
  d3.selectAll(".np1").attr("transform", transform(d3.event.transform));
}

function transform(t) {
  return function(d) {
    zoomer = t; 
    return "translate(" + t.apply([x_scale(d.X), y_scale(d.Y)]) + ")";
  };
}

function zoom2() {
  enter_s2.attr("transform", transform2(d3.event.transform));
  d3.selectAll(".np2").attr("transform", transform2(d3.event.transform));
}

function transform2(t) {
  return function(d) {
    zoomer2 = t; 
    return "translate(" + t.apply([x_scale_2(d.X2), y_scale_2(d.Y2)]) + ")";
  };
}

d3.select("#main_div").append("button")
    .attr("id", "enable")
    .text("zoom/brush")
    .on("click", function(d) {
        if (brushEnable){
            brush_1.call(d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", zoom));
            brush_1.on('.brush', null);
            brush_2.call(d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", zoom2));
            brush_2.on('.brush', null);
            brushEnable = false;
        }else{
            brush_1.on('.zoom', null);
            brush_1.call(d3.brush()
            .on("start", start)
            .on("brush end", brushed));
            brush_2.on('.zoom', null);
            brush_2.call(d3.brush()
            .on("start", start)
            .on("brush end", brushed_2));
            brushEnable = true;
        }
    });