from flask import Flask
import subprocess
from flask_cors import CORS
from flask import request
app = Flask(__name__)
CORS(app)

@app.route('/eval', methods=['POST'])
def eval():
    code = request.json['code']
    return subprocess.check_output(['python', '-c', code])
