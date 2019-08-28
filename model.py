import torch
from pytorch_transformers import BertTokenizer, BertModel

import torch.nn as nn
import torch.nn.functional as F

class SNLIClassifier(nn.Module):

    def __init__(self, num_class, device):
        super().__init__()
        self.tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        self.device = device
        self.bert = BertModel.from_pretrained('bert-base-uncased')
        self.bert.to(device)
        self.fc = nn.Linear(self.bert.config.hidden_size, num_class)

    def forward(self, premise, hypothesis):
        premise = '[CLS] '+ premise + ' [SEP]'
        hypothesis = '[CLS] '+ hypothesis + ' [SEP]'

        tokenized_premise = self.tokenizer.tokenize(premise)
        tokenized_hypothesis = self.tokenizer.tokenize(hypothesis)
        tokenized_text = tokenized_premise + tokenized_hypothesis

        indexed_tokens = self.tokenizer.convert_tokens_to_ids(tokenized_text)
        segments_ids = [0 for i in tokenized_premise] + [1 for i in tokenized_hypothesis]

        tokens_tensor = torch.tensor([indexed_tokens]).to(self.device)
        segments_tensors = torch.tensor([segments_ids]).to(self.device)
        bert_output = self.bert(tokens_tensor, token_type_ids=segments_tensors)

        return self.fc(bert_output[0][0, 0])