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

@app.route("/api/upload", methods=["POST"])
def upload():
    file = request.files.get("file")
    if not file:
        return jsonify(error="No file"), 400
    df = load_csv(file)
    DATA["df"] = df
    return jsonify(rows=len(df), columns=list(df.columns))

@app.route("/api/summary")
def summary():
    return jsonify(summary_stats(DATA["df"]))


@app.route("/api/types")
def types():
    return jsonify(column_types(DATA["df"]))

if __name__ == "__main__":
    app.run(debug=True)