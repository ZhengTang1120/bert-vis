import numpy as np
import pickle
import math
import json
# from random import sample

(sentences, n_words, word2id, points) = pickle.load( open( 'save.p', 'rb' ) )
(sentences2, n_words2, word2id2, points2) = pickle.load( open( 'save2.p', 'rb' ) )

def get_result(query):
    
    xs = []
    ys = []
    xs2 = []
    ys2 = []
    res = []
    for eid, sid, wid in word2id[query]:
        point =  points[eid]
        point2 =  points2[eid]
        sentence = sentences[sid][:]
        sentence1 = sentence[:wid]
        sentence2 = sentence[wid+1:]
        query = sentence[wid]
        sentence1 = [w for w in sentence1 if w != '[CLS]' and w != '[SEP]']
        sentence2 = [w for w in sentence2 if w != '[CLS]' and w != '[SEP]']
        jl = {'X': float(point[0]), 'Y': float(point[1]), 'X2': float(point2[0]), 'Y2': float(point2[1]), 'Sentence1': ' '.join(sentence1), 'query': query, 'Sentence2': ' '.join(sentence2)}
        xs.append(point[0])
        ys.append(point[1])
        xs2.append(point2[0])
        ys2.append(point2[1])
        res.append(jl)
    return {"scores": json.dumps(res), "x0": math.floor(min(xs)), "x1": math.ceil(max(xs)), 
            "y0": math.floor(min(ys)), "y1": math.ceil(max(ys)),
            "x02": math.floor(min(xs2)), "x12": math.ceil(max(xs2)), 
            "y02": math.floor(min(ys2)), "y12": math.ceil(max(ys2))}

for word in word2id:
    res = get_result(word)
    with open("static/words/%s.js"%word, "w") as f:
        f.write("var scores = ")
        f.write(res["scores"])
        f.write(";\n")
        f.write("var x0 = ")
        f.write(str(res["x0"]))
        f.write(";\n")
        f.write("var x1 = ")
        f.write(str(res["x1"]))
        f.write(";\n")
        f.write("var y0 = ")
        f.write(str(res["y0"]))
        f.write(";\n")
        f.write("var y1 = ")
        f.write(str(res["y1"]))
        f.write(";\n")
        f.write("var x02 = ")
        f.write(str(res["x02"]))
        f.write(";\n")
        f.write("var x12 = ")
        f.write(str(res["x12"]))
        f.write(";\n")
        f.write("var y02 = ")
        f.write(str(res["y02"]))
        f.write(";\n")
        f.write("var y12 = ")
        f.write(str(res["y12"]))
        f.write(";\n")
