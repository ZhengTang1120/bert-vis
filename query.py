import numpy as np
import pickle
import math

def get_result(query):
    (sentences, n_words, word2id, points) = pickle.load( open( "save.p", "rb" ) )
    xs = []
    ys = []
    res = []
    for eid, sid, wid in word2id[query]:
        point =  points[eid]
        sentence = sentences[sid][:]
        sentence1 = sentence[:wid]
        sentence2 = sentence[wid+1:]
        query = sentence[wid]
        sentence1 = [w for w in sentence1 if w != "[CLS]" and w != "[SEP]"]
        sentence2 = [w for w in sentence2 if w != "[CLS]" and w != "[SEP]"]
        jl = {"X": point[0], "Y": point[1], "Sentence1": ' '.join(sentence1), "query": query, "Sentence2": ' '.join(sentence2)}
        xs.append(point[0])
        ys.append(point[1])
        res.append(jl)
    return (res, math.floor(min(xs)), math.ceil(max(xs)), math.floor(min(ys)), math.ceil(max(ys)))

print (get_result("dog"))