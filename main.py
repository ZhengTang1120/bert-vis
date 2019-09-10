from flask import Flask, request, render_template
from query import get_result
app = Flask(__name__)


@app.route('/')
def my_form():
    return render_template('./main.html')

@app.route('/', methods=['POST'])
def my_form_post():
    text = request.form['text']
    print (get_result(text))
    return text

if __name__ == '__main__':
    app.run()