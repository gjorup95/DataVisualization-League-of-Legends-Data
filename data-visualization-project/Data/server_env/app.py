from flask import Flask, request
import json
import sys
sys.path.insert(0, '..')
from datahandler import DataHandler as DataHandler

app = Flask(__name__)
dataHandler = DataHandler()


@app.route("/")
def home():
    return "API"

# http://127.0.0.1:5000/get/fulldata?name=FnatInflation
@app.route("/get/fulldata", methods=['GET'])
def getFullData():
    name = request.args.get('name', default='null', type=str)
    data = dataHandler.getFullData(name)
    return str(data)

# http://127.0.0.1:5000/get/timeline?matchNo=1
@app.route("/get/timeline", methods=['GET'])
def getTimeline():
    matchNo = request.args.get('matchNo', default='null', type=int)

    if(data == ""):
        return "Data is null"

    timeline = dataHandler.getTimeline(matchNo, data)
    return str(timeline)
