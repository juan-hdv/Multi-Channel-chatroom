import os

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, send, join_room, leave_room
from collections import deque
from datetime import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


# CLASSES 
# *  usersClass 
# *  postsClass
# *  channelsClass

# USER
# A list of users logged to any chat room 
class usersClass():
    def __init__(self):
        self.list = []

    # True if user exists in list, false otherwise
    def exists (self, user):
    	return user in self.list

    # Login user with a non empty string username
    def login (self, user):
    	self.list.append (user)

	# Logout user with a non empty string username
    def logout (self, user):
    	if user in self.list:
    		self.list.remove (user) 
# End userClass 


# POSTS
# A queue of posts [<post1>,...,<postN>]
# Where <postI> = 
#       {'msg': <message string>,
#        'timestamp': <timestamp>,
#        'username': <username> }
class postsClass():

    def __init__ (self):
        self.posts =  deque([])
        self.count = 0

    # Last post (more recent post)
    def last (self):
        if (self.count == 0):
            return None
        else:
            return self.posts [self.count-1] 

    # Add a new user message to post list
    # @param {string} msg - The message to post
    # @param {string} username - The username posting message
    # @return post {msg:<message>,timestamp:<tstamp>, username:<username>}
    
    def add (self, username, msg):
        self.count += 1
        pst = { 'id': self.count,
        		'msg': msg, 
                'timestamp': datetime.now().strftime("%m/%d/%Y, %H:%M:%S"), 
                'username': username }
        self.posts.append(pst)
        # Only 100 post are keeped
        if (self.count > 100):
            self.posts.popleft() # Delete first element
        return pst

    # Delete a message in post list
    # @param {int} index - The message index in the post list
    def delete (self, index):
        del self.posts[index]
        self.count -= 1
 # End postsClass


#
# CHANNELS
# Dictionary of channels with its corresponding posts arrays
#          [ "<ChannelName1>" => ["post11",...,"post1n"],
#            "<ChannelName2>" => ["post21",...,"post2n"],
#            ...
#            "<ChannelNameN>" => ["post21",...,"post2n"] ]
class channelsClass ():

    # Create a new empty channel list. 
    # If load=true, populate the list with persisted info
    def __init__ (self):
        self.dict = {} # A dictionary

    # Add a new channel with name cName and a new (empty) posts list
    # @param {string} cName - The channel name
    def add (self,cName):
    	self.dict[cName] = postsClass () 

    # Delete a channel with name cName
    # @param {string} cName - The channel name
    def delete (self,cName):
    	del self.dict[cName]

    # True if cName exists in the channels list, otherwise false
    # @param {string} cName - The channel name
    def exists (self,cName):
    	return self.dict.get(cName) != None

    # Return and ordered lists of channels
    def toList(self):
    	return sorted (list(self.dict.keys()))

    # Add a new msg (post) to the channel cName from username 
    # @param {string} cName - The channel name
    # @param {string} username - The username who posted
    # @param {string} msg - The message posted
    def addPost(self,cName, username, msg):
    	return self.dict[cName].add(username, msg)

    def postsList(self,cName):
    	return list(self.dict[cName].posts)

# End class channelsList

users = usersClass ()
channels = channelsClass ()

@app.route ("/")
def index():
	return render_template("index.html", users=users.list, channels=channels.toList())

# Server side socket Event Handlers  
# The names "join", "leave", "message", "json", "connect" and "disconnect" are reserved and cannot be used for named events.
# send() and emit() are used for unnamed and named events respectively.

@socketio.on('connect')
def on_connect():
	# Send channelsList
	emit('connected',{'channels' : channels.toList()})

@socketio.on('disconnect')
def on_connect():
	print ('disconnected')
	send('disconnected', broadcast=True)	

@socketio.on ('userLog')
# @param username {string} - The non empty username for login or logout
# @param login {bool} - True for logon , False for logout
def on_userLog(username, login):
	if login:
		if users.exists(username):
			# Username not available in user list
			emit('alertMessage',('usernameNotAvailable','alert-warning',username))
		else: 	
			users.login(username)
	else: # logout
		users.logout(username)
	emit('userLogged',(username, login))

@socketio.on ('channelCreate')
# @param 	channelName {string} - The channel name
# @return 	channelName {string} - The channel name
# 			channelsList {array} - Alphabeticaly Ordered list of channels
# OR 		alertMessage if channel exists			
def on_channelCreate (username, channelName):
	if not channels.exists (channelName):
		channels.add(channelName)
		emit('channelCreated', (username, channelName, channels.toList()), broadcast=True)
	else:
		emit('alertMessage',('channelNameNotAvailable','alert-warning',channelName))

@socketio.on ('channelDelete')
# @param 	channelName {string} - The channel name
# @return 	channelName {string} - The channel name
# 			channelsList {array} - Alphabeticaly Ordered list of channels
# OR 		alertMessage if channel does not exist
def on_channelDelete (username, channelName):
	if channels.exists (channelName):
		channels.delete (channelName)
		emit('channelDeleted', (username, channelName, channels.toList()), broadcast=True)
	else: 
		emit('alertMessage',('channelNameNotExist','alert-danger',channelName))

# Join a room
@socketio.on('joinRoom')
def on_join (username, channelName):
	join_room(channelName)
	emit('actOnRoom',(username, channelName, 'entered', channels.postsList(channelName)), room=channelName)

# Leave a room
@socketio.on('leaveRoom')
def on_leave (username, channelName):
	leave_room(channelName)
	emit('actOnRoom',(username, channelName, 'leaved', channels.postsList(channelName)), room=channelName)

@socketio.on ("submitPost")
# @param 	username {string} - The username who post
# @param 	channelName {string} - The channel name where posted
# @param 	msg {string} - The message posted
def on_submitPost (username, channelName, msg):
	postObj = channels.addPost(channelName, username, msg)
	# print (f"ID:{postObj['id']}, T:{postObj['timestamp']}, USR:{postObj['username']}, MSG:{postObj['msg']}")
	emit ('messagePosted',(channelName, postObj), room=channelName)


if __name__ == '__main__':
    socketio.run(app)