from model import *
from utils import *
import random
import time

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def train_func(model, train_set):
    train_loss = 0
    train_acc = 0

    for i, (premise, hypothesis, cls) in enumerate(train_set):
        cls = torch.tensor([cls], dtype=torch.int64).to(device)
        optimizer.zero_grad()
        output = model(premise, hypothesis)
        loss = criterion(output.view(1, 4), cls)
        train_loss += loss.item()
        loss.backward()
        optimizer.step()
        train_acc += (output.argmax(0) == cls).sum().item()
    scheduler.step()
    return train_loss / len(train_set), train_acc / len(train_set)

def test(model, data):
    model.bert.eval()
    loss = 0
    acc = 0
    for premise, hypothesis, cls in data:
        cls = torch.tensor([cls], dtype=torch.int64).to(device)
        with torch.no_grad():
            output = model(premise, hypothesis)
            loss = criterion(output.view(1, 4), cls)
            loss += loss.item()
            acc += (output.argmax(0) == cls).sum().item()

    return loss / len(data), acc / len(data)

if __name__ == '__main__':
    random.seed(1)

    train_set = prepare_jldata("snli_1.0/snli_1.0_train.jsonl")
    dev_set = prepare_jldata("snli_1.0/snli_1.0_dev.jsonl")
    model = SNLIClassifier(4, device).to(device)

    criterion = torch.nn.CrossEntropyLoss().to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-5)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, 1, gamma=0.9)

    for epoch in range(100):

        start_time = time.time()

        train_loss, train_acc = train_func(model, train_set)
        valid_loss, valid_acc = test(model, dev_set)

        secs = int(time.time() - start_time)
        mins = secs / 60
        secs = secs % 60

        print('Epoch: %d' %(epoch + 1), " | time in %d minutes, %d seconds" %(mins, secs))
        print(f'\tLoss: {train_loss:.4f}(train)\t|\tAcc: {train_acc * 100:.1f}%(train)')
        print(f'\tLoss: {valid_loss:.4f}(valid)\t|\tAcc: {valid_acc * 100:.1f}%(valid)')

    