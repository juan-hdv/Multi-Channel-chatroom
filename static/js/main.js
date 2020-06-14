// * * * * General use functions 

/** Convert a string to CamelCase, deleting spaces */
function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

function reset_animation (selector) {
    var sel = document.querySelector(selector);
    sel.style.animation = 'none';
    sel.offsetHeight; /* trigger reflow */
    sel.style.animation = null; 
}
/**
 * Display a message a in the message_zone 
 * @param {string} msg - The message to be shown
 * @param {string} msgType - Bootstrap Alert Type
 *        alert-primary (blue)
 *        alert-secondary (Light gray)
 *        alert-success (green)
 *        alert-danger (red)
 *        alert-warning (yellow)
 *        alert-info (Blue oil)
 *        alert-light (white)
 *        alert-dark (Dark gray)
 */ 
function alertMessage (msg, msgType) {
    reset_animation ('#message_zone');
    document.querySelector('#message_div').setAttribute('class',`alert ${msgType}`);
    document.querySelector('#message_div').innerHTML = msg;
}  

// * * *  USER Functions
var $currentUsername = '';
// Get registered user in local storage
function loadLocalUsername () {
    let u = localStorage.getItem('username'); 
    if(!u || u === null || u === '')
        u = '';
    return u;
}

// Save local storage current user
function saveLocalUsername (username) {
    localStorage.setItem('username', username); 
}

/** Refresh page with informaction about current user 
 *  @param {string} - The username (if '' the user is not logged)
 */
function userHtmlRefresh (username) {
    const userLogged = username!='';
    // Welcome Username !!!
    document.querySelector('#usernameText').innerHTML = userLogged?username:"_";

    if (userLogged) {
        alertMessage (`Hello ${username}! Welcome to the chat room!`, "alert-info");
        userHtmlSectionsVisibility (false,true);
    } else {
        alertMessage ("Please login to enter the chat room", "alert-info");
        userHtmlSectionsVisibility (true,false);
    }
} // end userHtmlRefresh

/** 
 * Change visibility of the 2 main sections "section#getUserName" (top) and section#postsList (bottom)
 * @param {bool} boolS1 - Section1 (section#getUserName) Visibility flag
 * @param {bool} boolS2 - Section2 (section#postsList) Visibility flag
 */
function userHtmlSectionsVisibility (boolS1,boolS2) {
    // Section for getting user name
    document.querySelector('section#getUserName').style.display = (boolS1?'block':'none');
    document.querySelector('#usernameDiv').style.visibility = (boolS1?'hidden':'visible');
   
    // Section for posting messages
    document.querySelector('section#postsList').style.display = (boolS2?'block':'none');

} // ENd userHtmlSectionsVisibility


// * * * * CHANNEL Functions
var currentChannel = '';
// Get current channel from local storage
function loadLocalChannelName () {
    let c = localStorage.getItem('chanelName'); 
    if(!c || c === null || c === '')
        c = '';
    return c;
}

// Save local storage current channel
function saveLocalChannelName (channelName) {
    localStorage.setItem('chanelName', channelName); 
}

// Populate the channel Select with the list of existing chanels
function channelsHtmlRefresh (channelsList, currentChannel) {

    if (channelsList == undefined || channelsList == null) return

    // Delete previous list
    let sel = document.querySelector('select#channelSelect');
    sel.innerHTML = '';

    // Create the default "None" entry at index 0
    let opt = document.createElement("option");
    opt.value = "0";
    opt.text = 'None';
    sel.add(opt, null);

    // Construct Select with ordered list of channels
    channelsList.forEach (item => { 
        let opt = document.createElement("option");
        opt.value = item;
        opt.text = item;
        opt.selected = item == currentChannel?true:false ;
        sel.add(opt, null);
    });

    // Trigger a select change (for refreshing Post Section)
   document.querySelector('select#channelSelect').onchange();
} // End channelsHtmlRefresh


// * * * * POSTS Functions
// Refresh html page with posts list
function postsHtmlRefresh (channelName, postsList) {
    document.querySelector('#posts').innerHTML = ''
    if (channelName != '')
        postsList.forEach ( p => { postsHtmlPrintMessage (channelName, p) });
} // End postsHtmlRefresh

/**
 * Display post in page (html)
 * @parameter {string} channelName  - The current chanelname
 * @parameter {string} postObj      - The message to post {id:,timestampo:,username:,msg:}
 */
function postsHtmlPrintMessage (channelName, postObj) {
    let postList = document.querySelector('#posts')
    const post = document.createElement('div');
    post.id = postObj.id;
    post.className = 'post';
    if (postObj.id != '') // postObj.timestamp also == ''
        post.innerHTML = `<small>${postObj.timestamp}</small> - ${postObj.username}&nbsp;&nbsp;${postObj.msg}`;
    else
        post.innerHTML = postObj.msg;
    document.querySelector('#posts').append(post);
} // ENd postsHtmlPrintMessage


/** * * * * GENERAL CONTROL EVENTS 

/** When load page */
document.addEventListener('DOMContentLoaded', load);

/** Load
 * - If new user ask for a username an login, otherwise display username of returning user
 * - If no channels exists create a the first new empty channel, otherwise refresh the existing channels list
 * - Get 
 * - Set "onclick" event handlers for login, logout, createChannel, deleteChannel
 * - Set "change"  event handlers for Select channel
 */
function load () {
    // * * * EVENT HANDLERS -------------------------------

    /** LOGIN USER:- Click button to login user */
    document.querySelector('#loginButton').onclick = () => {
        let username = document.querySelector('#usernameField').value;
        username = camelize (username);
        if (username) {
            // Send Login event to server for username - Login new user, and logout current user
            socket.emit('userLog',username, true);
        } else // No user
            alertMessage ("Username empty. Please type your username", "alert-danger");
        document.querySelector('#usernameField').value = '';    
    } // End ('#loginButton').onclick

    /** LOGOUT USER:- Click button to logout a user */
    document.querySelector('#logoutButton').onclick = () => {
        // Send Login event to server for username - Logout currentuser and No new user
        socket.emit('userLog', $currentUsername, false);
    }

    /** CREATE A CHANNEL:- Click button to CREATE non existing CHANNEL */
    document.querySelector('#createChannelButton').onclick = () => {
        let chan = document.querySelector('#channelField').value;
        chan = camelize (chan);
        if (!chan)
            alertMessage ("Channel name required. Please type a channel name.","alert-warning");
        else    
            socket.emit ('channelCreate',$currentUsername, chan);
        // Clear imput field
        document.querySelector('#channelField').value = '';
    } // End ('#createChannelButton').onclick 

    /** DELETE CHANNEL:- Click button to DELETE existing CHANNEL */
    document.querySelector('#deleteChannelButton').onclick = () => {
        let  chan = document.querySelector('select#channelSelect').value;
        if (chan == 0) // "None" entry
            alertMessage ("Nothing to delete. Please select a channel.","alert-warning");
        else
            socket.emit ('channelDelete',$currentUsername, chan);
    } // End ('#deleteChannelButton').onclick 

    /** SELECT/CHANGE CHANNEL or ROOM:- Change Selector to SELECT a CHANNEL */
    document.querySelector('select#channelSelect').onchange =function () {
        let cTitle = this.value == 0?'No room active':this.value;
        document.querySelector('span#channelName').innerHTML = cTitle;
        if ($currentChannelName != '')
            socket.emit('leaveRoom',$currentUsername, $currentChannelName);
        $currentChannelName = this.value == 0?'':this.value;
        if ($currentChannelName != '')
            socket.emit('joinRoom',$currentUsername, $currentChannelName);
        else 
            postsHtmlRefresh ('', []); // Clear post for No channel
    } // End ('select#channelSelect').onchange

    /** POST MESSAGE:- Click button to POST a Message */
    document.querySelector('#postMessageButton').onclick = () => {
        let msg = document.querySelector('#postMessageField').value;
        if (!msg && !$attachedImage) {
            alertMessage ("Nothing to post.","alert-warning");
        } else {
            // Emit socket event to server
            $attachedImage = $attachedImage==''?'':$attachedImage+"\n";
            socket.emit('submitPost',$currentUsername, $currentChannelName, $attachedImage + msg);
            // Clear attachments from post form
            $attachedImage = '';
            document.querySelector('#attachedImage').innerHTML = '';
        }
        document.querySelector('#postMessageField').value = '';
    } // End ('#postMessageButton').onclick


    // * * * SOCKET EVENTS received from flask Server

    /** CONNECT:- to websocket */
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    /** CONNECTED:- When connected */
    socket.on ('connected', (chan) => {
        // chan = {'channels':<list>}
        channelsHtmlRefresh (chan.channels, $currentChannelName);
        if ($currentChannelName != '')
            socket.emit('joinRoom',$currentUsername, $currentChannelName);
    });

    /** DISCONNECTED:- When disconnected */
    socket.on ('disconnected', () => {
        let u = 'Someone >' + $currentUsername + "in channel>" + $currentChannelName;
        let msg = `${u} has leaved the room.`;
        let postObj = {'id':'', 'timestamp':'', 'username':u, 'msg':msg};
        postsHtmlPrintMessage ($currentChannelName, postObj);
    });

    // USER LOGGED:- If login=True, username has loggedin, otherwise username has loggedout
    socket.on ('userLogged', (username, login) => {
        if (!login) 
            username = '';
        $currentUsername = username;
        saveLocalUsername($currentUsername);
        userHtmlRefresh ($currentUsername);
    });

    // CHANNEL CREATED AND DELETED:- Serves channelCreated and channelDeleted
    function channelOperation (username, channelName, channelList, operation) {
        $cChannel = '';
        if (operation == 'created')
            $cChannel = channelName;
        else if (operation == 'deleted')
            $cChannel = '';
        if (username == $currentUsername) {
            $currentChannelName = $cChannel; 
            saveLocalChannelName($currentChannelName);
            alertMessage (`Channel "${channelName}" successfully ${operation}.`,'alert-success');
        }
        channelsHtmlRefresh (channelList, $currentChannelName);
    } // End channelOperation
    // When Channel name is created 
    socket.on ('channelCreated', (username, channelName, channelList) => { 
        channelOperation (username, channelName, channelList, 'created');
    });
    // When Channel name is deleted 
    socket.on ('channelDeleted', (username, channelName,channelList) => { 
        channelOperation (username, channelName, channelList, 'deleted');
    });

    // HANDLE LIVE AN JOIN Channel
    // @parameter {string} username - The username
    // @parameter {string} channelName - The channel name where the user did the operation (entered o leaved)
    // @parameter {string} operation - The last tense of the user action: 'Entered' or 'Leaved' (the room)
    // @parameter {string} postList - List of posts
    socket.on ('actOnRoom', (username, channelName, act, postsList) => {
        // postObj {id:,timestamp:,username:,msg:}
        let msg = `${username} has ${act} the room.`;
        let postObj = {'id':'', 'timestamp':'', 'username':username, 'msg':msg};
        if (username == $currentUsername)
            // Refresh posts on current channel
            postsHtmlRefresh (channelName, postsList);
        else 
            // Print "has entered/leaved"
            postsHtmlPrintMessage (channelName, postObj);
    });

    /** When Receibing a broadcast message from Server to display */
    socket.on ('messagePosted', (channelName, postObj) => {
        // Print message in page
        postsHtmlPrintMessage (channelName, postObj);
    });

    /** MESSAGE POSTED:- When Receiving an error message from Server to display */
    socket.on ('alertMessage', (messageCode, messageType, variable) => {
        // Print message in page
        if (messageCode == 'usernameNotAvailable')
            alertMessage (`The username "${variable}" is already used. Please use a different name.`, messageType);
        else if (messageCode == 'channelNameNotAvailable')
            alertMessage (`Channel name already exists: ${variable}. Please type a different channel name.`,messageType);
        else if (messageCode == 'channelNameNotExist')
            alertMessage (`Channel name does not exist: ${variable}. Please select an existing chanel.`,messageType);
    });

    // Event listener for file load attachments. Produce => $imgContent
    $attachedImage = '';
    document.getElementById('files').addEventListener('change', handleFilesSelect, false);        
    document.getElementById('filesClear').addEventListener('click', handleFilesClear, false);        

    // Get the current user logged from local storage, otherwise ''
    $currentUsername = loadLocalUsername();
    userHtmlRefresh ($currentUsername);

    // Get the current channel
    $currentChannelName = loadLocalChannelName();

} // End load
