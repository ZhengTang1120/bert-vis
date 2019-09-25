import umap
import torch
from pytorch_transformers import BertTokenizer, BertModel
from utils import *
from collections import defaultdict
import numpy as np
import pickle
from random import sample
import argparse

from sklearn.cluster import AffinityPropagation

sentences = list()
n_words = 0
word2id = defaultdict(list)

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--model', nargs='?')
    parser.add_argument('output')
    args = parser.parse_args()

    train_set = prepare_jldata("snli_1.0/snli_1.0_train.jsonl")
    dev_set = prepare_jldata("snli_1.0/snli_1.0_dev.jsonl")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    if args.model:
        print ("1")
        model = torch.load(args.model)
        bert = model.bert
        tokenizer = model.tokenizer
    else:
        print ("2")
        tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        bert = BertModel.from_pretrained('bert-base-uncased')
    bert.to(device)
    bert.eval()

    for i, (premise, hypothesis, cls) in enumerate(dev_set):
        premise = '[CLS] '+ premise + ' [SEP]'
        hypothesis = hypothesis + ' [SEP]'

        

        tokenized_premise = tokenizer.tokenize(premise)
        tokenized_hypothesis = tokenizer.tokenize(hypothesis)
        tokenized_text = tokenized_premise + tokenized_hypothesis
        sentences.append(tokenized_text)

        for j, w in enumerate(tokenized_text):
            word2id[w].append((n_words, i, j))
            n_words += 1

        indexed_tokens = tokenizer.convert_tokens_to_ids(tokenized_text)
        segments_ids = [0 for i in tokenized_premise] + [1 for i in tokenized_hypothesis]

        tokens_tensor = torch.tensor([indexed_tokens]).to(device)
        segments_tensors = torch.tensor([segments_ids]).to(device)
        bert_output = bert(tokens_tensor, token_type_ids=segments_tensors)
        if i == 0:
            vecs = bert_output[0].data.cpu().numpy()[0]
        else:
            vecs = np.concatenate((vecs, bert_output[0].data.cpu().numpy()[0]), axis=0)
    print ("finish")
    points = umap.UMAP().fit_transform(vecs)

    print (len(points), n_words)

    pickle.dump((sentences, n_words, word2id, points, vecs), open( args.output, "wb" ) )
    for query in word2id:
        points = list()
        for eid, sid, wid in word2id[query]:
            points.append(vecs[eid])
            sentence = sentences[sid][:]
            sentence1 = sentence[:wid]
            sentence2 = sentence[wid+1:]

        af = AffinityPropagation(preference=-50).fit(points)
        cluster_centers_indices = af.cluster_centers_indices_
        labels = af.labels_
        print (cluster_centers_indices, labels)

        # cluster by words, get the centroid
        # cluster the centroid, find the nearest words
    points = umap.UMAP().fit_transform(vecs)

    print (len(points), n_words)

    pickle.dump((sentences, n_words, word2id, points, vecs), open( args.output, "wb" ) )
    # (sentences, n_words, word2id, points) = pickle.load( open( "save.p", "rb" ) )