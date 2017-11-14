# server.py
from flask import Flask, render_template

application = Flask(__name__, static_folder="../static/dist", template_folder="../static")

@application.route("/")
def index():
    return render_template("index.html")

@application.route("/hello")
def hello():
    return "Hello World! Changed from root access"

if __name__ == "__main__":
    application.run(host='0.0.0.0')
