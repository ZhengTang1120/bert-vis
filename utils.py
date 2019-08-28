import json

def prepare_jldata(file):

    training_set = list()
    label_mapping = {"-":0, "neutral":1, "contradiction":2, "entailment":3}

    for line in open(file):
        jl = json.loads(line)

        premise = jl["sentence1"].lower()
        hypothesis = jl["sentence2"].lower()
        gold_label = jl["gold_label"]

        training_set.append(
            (
                premise,
                hypothesis,
                label_mapping[gold_label]
            )
        )

    return training_set

