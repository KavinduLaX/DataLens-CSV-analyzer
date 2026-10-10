from flask import Flask, jsonify, request
from analysis import *

app = Flask(__name__)
DATA = {}


@app.route("/")
def home():
    return "DataLens running"


@app.route("/health")
def health():
    return jsonify(status="ok")


if __name__ == "__main__":
    app.run(debug=True)