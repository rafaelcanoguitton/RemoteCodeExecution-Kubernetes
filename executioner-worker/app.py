from flask import Flask
from flask_cors import CORS
from flask import request
from flask_socketio import SocketIO, join_room, leave_room, send, emit
import pexpect
import subprocess

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")
current_code_per_room = {}


@app.route('/eval', methods=['POST'])
def eval():
    code = request.json['code']
    # inputs =["a","!"]
    # outputs = []
    # child = pexpect.spawn('python3')
    # try:
    #     child.expect('>>>')
    #     for line in code.splitlines():
    #         child.sendline(line)
    #         child.expect('>>>', timeout=1)
    #         outputs.append(child.before.decode('utf-8'))
    #     child.sendline('exit()')
    #     child.expect(pexpect.EOF)
    #     return '\n'.join(outputs)
    try:
        return subprocess.check_output(['python', '-c', code])
    except Exception as e:
        print(e)
        return "Error"


@app.route('/code_from_room', methods=['POST'])
def code_from_room():
    room = request.json['room']
    return current_code_per_room[room]


@socketio.on('join')
def begin_chat(data):
    print('begin_chat', data)
    room = data['room']
    if room not in current_code_per_room:
        current_code_per_room[room] = data['code']
    join_room(room)

# @socketio.on('join-existing')
# def join_existing(data):
#     print('join_existing', data)
#     room = data['room']
#     join_room(room)
#     send(current_code_per_room[room], room=room)


@socketio.on('leave')
def end_chat(data):
    print('end_chat', data)
    room = data['room']
    leave_room(room)


@socketio.on('message')
def handle_message(data):
    print('message', data)
    room = data['room']
    message = data['message']
    current_code_per_room[room] = message
    send(message, to=room)


@socketio.on('connect')
def on_connect():
    print('connect')


if __name__ == '__main__':
    socketio.run(app, debug=True, port=8000)
