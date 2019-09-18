import numpy as np
import pickle
import math
import json
# from random import sample

(sentences, n_words, word2id, points) = pickle.load( open( 'save.p', 'rb' ) )

def get_result(query):
    
    xs = []
    ys = []
    res = []
    for eid, sid, wid in word2id[query]:
        point =  points[eid]
        sentence = sentences[sid][:]
        sentence1 = sentence[:wid]
        sentence2 = sentence[wid+1:]
        query = sentence[wid]
        sentence1 = [w for w in sentence1 if w != '[CLS]' and w != '[SEP]']
        sentence2 = [w for w in sentence2 if w != '[CLS]' and w != '[SEP]']
        jl = {'X': float(point[0]), 'Y': float(point[1]), 'Sentence1': ' '.join(sentence1), 'query': query, 'Sentence2': ' '.join(sentence2)}
        xs.append(point[0])
        ys.append(point[1])
        res.append(jl)
    return {"scores": json.dumps(res), "x0": math.floor(min(xs)), "x1": math.ceil(max(xs)), 
            "y0": math.floor(min(ys)), "y1": math.ceil(max(ys))}

# for word in word2id:
#     res = get_result(word)
#     with open("static/words/%s.js"%word, "w") as f:
#         f.write("var scores = ")
#         f.write(res["scores"])
#         f.write(";\n")
#         f.write("var x0 = ")
#         f.write(str(res["x0"]))
#         f.write(";\n")
#         f.write("var x1 = ")
#         f.write(str(res["x1"]))
#         f.write(";\n")
#         f.write("var y0 = ")
#         f.write(str(res["y0"]))
#         f.write(";\n")
#         f.write("var y1 = ")
#         f.write(str(res["y1"]))
#         f.write(";\n")
