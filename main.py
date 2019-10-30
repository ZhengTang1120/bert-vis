from flask import Flask, request, render_template, redirect, url_for
import json

app = Flask(__name__)

@app.route('/')
def my_form():
    return render_template('./main.html')


@app.route('/', methods=['POST'])
def my_form_post():
    text = request.form['text']
    with open("static/scores.js", "w") as f:
        with open ("static/words2/%s.js"%text) as r:
            f.write(r.read())
    return redirect(url_for('query'))

@app.route('/query/')
def query():
    return render_template('./query.html')

if __name__ == '__main__':
    app.run()