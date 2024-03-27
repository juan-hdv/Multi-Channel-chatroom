# CS50-PROJECT 2: Flask - Multi channel chatroom

### Author/Date

      Juan Gabriel MEJÍA / 2020-06-19

## INTRODUCTION
### Description
This project is aimed to develop a chatroom with multiple channels. The persons, in different locations, can talk in a room in real time.

The involved techonologies include: Python, Flask, Flask-IOSocket, JavaScript (ECMAScript 6 - ES6), HTML5 and CSS3.

### Academic Objectives of HarvardX: CS50W
* Learn to use JavaScript to run code server-side.
* Become more comfortable with building web user interfaces.
* Gain experience with Socket.IO to communicate between clients and servers.

include a short writeup describing your project, what’s contained in each file, and (optionally) any other additional information the staff should know about your project. Also, include a description of your personal touch and what you chose to add to the project.

## PROJECT DETAILS
### Environment Variables
 Before running this project, some environment variables must be set.

 **Set variables**: For Ubuntu, set the following variables in ~/.profile ()

 	# Python development variables
	export FLASK_APP="application.py"
	export FLASK_DEBUG=1
	export FLASK_ENV="development"

**Create an Enviroment**: Before running this project, an Environment must be set for Python 3 and requirements.txt must be then installed. To do so, follow this steps:

	python3 -m venv my-project-env
	source my-project-env/bin/activate
	pip install requests

### Project files

* static/
  * css/
    * main.css: 	The particular project styles. It is generated from main.scss.
    * main.scss:  A Sass file corresponding to the main.css
  * img/:   A directory for used images.
  * js/
    * attachments.js: Functions for handling images attachments for the posted messages.
  	* main.js: Main js file containing functions for handeling: general porpuse actions, users, channels display, posts display, user interface events and ioSockets events responses.
  * templates/
    * http_error404.html: error page for 404 error (Page Not Found)
    * layout.html: root template from which the others inherit.
  	* index.html:  main page for the chat rooms.
    * test.html: Just a file for testing.
* .gitignore: file for telling git to igonore some files.
* application.py: the main program containing the main Flask route (/), and all the socketio event handlers. It also contains the classes for storing Users of chat rooms, Channels and Posts per Channel.  
* README.md: This file.
* requirements.txt: All the packages that must be installed before running this project. Use: pip -install requirements.txt
