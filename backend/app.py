from flask_socketio import SocketIO
from flask import Flask, jsonify, request
from flask_cors import CORS

# Start app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'Secret!'

socketio = SocketIO(app, cors_allowed_origins="*")
# CORS op gewone api routes moet ook blijven werken
CORS(app)

# Custom endpoint
endpoint = '/api/v1'


# ROUTES
@app.route('/')
def info():
    return jsonify(info='Please go to the endpoint ' + endpoint)


# SOCKET.IO EVENTS
@socketio.on('connect')
def connect():
    print("Een nieuwe client connectie")

    socketio.emit("connection_recieved", {
        "clientID": request.sid
    })


@socketio.on('F2B_new_logging')
def new_logging(payload):
    amount = payload.get('amount', 0)
    print("registering new loggin of %sml" % amount)

    data = DataRepository.create_log(datetime.now(), amount)  # returns id of the new row
    if data is not None:
        socketio.emit("B2F_addProgress", {"amount": amount}, broadcast=True)


# START THE APP
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port='5000', debug=True)
