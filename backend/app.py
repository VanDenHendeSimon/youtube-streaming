from flask_socketio import SocketIO
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import os
import re
import shutil


# Start app
template_dir = os.path.abspath('../frontend')
app = Flask(__name__, template_folder=template_dir)
app.config['SECRET_KEY'] = 'Secret!'

socketio = SocketIO(app, cors_allowed_origins="*")
# CORS op gewone api routes moet ook blijven werken
CORS(app)

# Custom endpoint
endpoint = '/api/v1'


def set_party_name(filepath, party_name):
    # read html file
    with open(filepath, 'r') as open_file:
        content = open_file.read()

    # replace updated data-party-name attribute in the html
    content = re.sub(
        r'data-party-name=\"\"',
        'data-party-name=\"%s\"' % party_name,
        content
    )

    # write html file
    with open(filepath, 'w') as write_file:
        write_file.write(content)


def verify_party(party_name):
    party_filepath = party_name.replace(' ', '_')
    party_filepath = '%s.html' % (re.sub(r'\W+', '', party_filepath).lower())

    payload = {
        'in_progress': os.path.exists(os.path.join(template_dir, party_filepath)),
        # v= of an instruction video about the website
        'url': 'http://127.0.0.1:5500/frontend/%s?v=FGBhQbmPwH8' % party_filepath,
    }

    return payload, party_filepath


# ROUTES
@app.route('/')
def info():
    return jsonify(info='Please go to the endpoint ' + endpoint), 300


@app.route(endpoint+'/create/<party_name>')
def craete_party(party_name):
    payload, filepath = verify_party(party_name)

    if not payload.get('in_progress', True):
        source_file = os.path.join(template_dir, "basePlayer.html")
        destinale_filepath = os.path.join(template_dir, filepath)

        # Copy file
        shutil.copyfile(source_file, destinale_filepath)
        # Change file
        set_party_name(destinale_filepath, party_name)

    return jsonify(payload), 200


@app.route(endpoint+'/join/<party_name>')
def join_party(party_name):
    return jsonify(verify_party(party_name)), 200


# SOCKET.IO EVENTS
@socketio.on('connect')
def connect():
    socketio.emit("connection_recieved", {
        "clientID": request.sid
    })


@socketio.on('F2B_pause')
def pause(payload):
    socketio.emit('pause-video', {'time': payload.get('time', 0)})


@socketio.on('F2B_play')
def play(payload):
    socketio.emit('play-video', {'time': payload.get('time', 0)})


@socketio.on('F2B_ClientCount')
def client_count(payload):
    print("Got client count request")
    socketio.emit('B2F_ClientCount', {
        'partyName': payload.get("partyName", 'name undefiend').replace('.html', '').replace('_', ' '),
        'count': 10
    })


# START THE APP
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port='5000', debug=True)
