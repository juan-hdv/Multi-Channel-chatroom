import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

#########################
#   ERROR HANDLERS
@app.errorhandler(404)
def page_not_found(e):
    return render_template('http_error404.html'), 404

@app.errorhandler(403)
def forbidden(e):
    return render_template('http_error403.html'), 403

app.register_error_handler(404, page_not_found)
app.register_error_handler(403, forbidden)
#########################


@app.route("/")
def index():
	return render_template("index.html")

