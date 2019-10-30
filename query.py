import numpy as np
import pickle
import math
import json
# from random import sample
from utils import *
from sklearn.cluster import AffinityPropagation
from collections import defaultdict

(sentences, n_words, word2id, points, vecs) = pickle.load( open( 'temp.p', 'rb' ) )
dev_set = prepare_jldata("snli_1.0/snli_1.0_dev.jsonl")
(sentences2, n_words2, word2id2, points2) = pickle.load( open( 'save2.p', 'rb' ) )
with open("predictions.txt") as f:
    predictions = f.read().split('\n')[:-1]

def get_result(query, sents):
    
    xs = []
    ys = []
    xs2 = []
    ys2 = []
    res = []
    for eid, sid, wid in word2id[query]:
        point =  points[eid]
        point2 =  points2[eid]
        sentence = sentences[sid][:]
        entailment = dev_set[sid][-1]
        prediction = predictions[sid].split()[0]
        sentence[wid] = sentence[wid]+"QUERY"
        jl = {'X': round(float(point[0]),2), 'Y': round(float(point[1]),2), 'X2': round(float(point2[0]),2), 
        'Y2': round(float(point2[1]),2), 'entailment':entailment, 'prediction':int(prediction), 
         'sent':sentence, 'pos':wid, "np":sents[sid]}
        xs.append(point[0])
        ys.append(point[1])
        xs2.append(point2[0])
        ys2.append(point2[1])
        res.append(jl)
    return {"scores": json.dumps(res), "x0": math.floor(min(xs)), "x1": math.ceil(max(xs)), 
            "y0": math.floor(min(ys)), "y1": math.ceil(max(ys)),
            "x02": math.floor(min(xs2)), "x12": math.ceil(max(xs2)), 
            "y02": math.floor(min(ys2)), "y12": math.ceil(max(ys2))}

def get_result2(word2id):
    
    xs = []
    ys = []
    xs2 = []
    ys2 = []
    res = []
    for query in word2id:
        for eid, sid, wid in word2id[query]:
            point =  points[eid]
            point2 =  points2[eid]
            sentence = sentences[sid][:]
            entailment = dev_set[sid][-1]
            prediction = predictions[sid].split()[0]
            jl = {'X': round(float(point[0]),2), 'Y': round(float(point[1]),2), 'X2': round(float(point2[0]),2), 
            'Y2': round(float(point2[1]),2), 'entailment':entailment, 'prediction':int(prediction), 
            'Sentence': sid, 'pos':wid}
            xs.append(point[0])
            ys.append(point[1])
            xs2.append(point2[0])
            ys2.append(point2[1])
            res.append(jl)
    return {"scores": json.dumps(res), "x0": math.floor(min(xs)), "x1": math.ceil(max(xs)), 
            "y0": math.floor(min(ys)), "y1": math.ceil(max(ys)),
            "x02": math.floor(min(xs2)), "x12": math.ceil(max(xs2)), 
            "y02": math.floor(min(ys2)), "y12": math.ceil(max(ys2))}

def groupBySent(word2id):
    sents = defaultdict(list)
    for query in word2id:
        for eid, sid, wid in word2id[query]:
            point =  points[eid]
            point2 =  points2[eid]
            sentence = sentences[sid][:]
            entailment = dev_set[sid][-1]
            prediction = predictions[sid].split()[0]
            sents[sid].append((round(float(point[0]),2),round(float(point[1]),2),round(float(point2[0]),2), round(float(point2[1]),2)))
    return sents

sents =  (groupBySent(word2id))
# print (sents)
# words, centers = pickle.load( open( "centers.p", "rb" ) )
# print (len(centers))
# af = AffinityPropagation(preference=-50).fit(centers)
# cluster_centers_indices = af.cluster_centers_indices_
# pickle.dump((cluster_centers_indices), open( "centers2.p", "wb" ) )
# centers = []
# words = []
# for query in word2id:
#     points = list()
#     for eid, sid, wid in word2id[query]:
#         points.append(vecs[eid])
#         sentence = sentences[sid][:]
#         sentence1 = sentence[:wid]
#         sentence2 = sentence[wid+1:]

#     af = AffinityPropagation(preference=-50).fit(points)
#     cluster_centers_indices = af.cluster_centers_indices_
#     labels = af.labels_
#     centers += [vecs[i] for i in cluster_centers_indices]
#     words += [query for i in cluster_centers_indices]

# pickle.dump((words, centers), open( "centers.p", "wb" ) )
# res = get_result2(word2id)
# with open("static/all.js", "w") as f:
#     f.write("var scores = ")
#     f.write(res["scores"])
#     f.write(";\n")
#     f.write("var x0 = ")
#     f.write(str(res["x0"]))
#     f.write(";\n")
#     f.write("var x1 = ")
#     f.write(str(res["x1"]))
#     f.write(";\n")
#     f.write("var y0 = ")
#     f.write(str(res["y0"]))
#     f.write(";\n")
#     f.write("var y1 = ")
#     f.write(str(res["y1"]))
#     f.write(";\n")
#     f.write("var x02 = ")
#     f.write(str(res["x02"]))
#     f.write(";\n")
#     f.write("var x12 = ")
#     f.write(str(res["x12"]))
#     f.write(";\n")
#     f.write("var y02 = ")
#     f.write(str(res["y02"]))
#     f.write(";\n")
#     f.write("var y12 = ")
#     f.write(str(res["y12"]))
#     f.write(";\n")
for word in word2id:
    res = get_result(word, sents)
    with open("static/words2/%s.js"%word, "w") as f:
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
