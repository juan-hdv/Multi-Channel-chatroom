



/* Convert a string to CamelCase, deleting spaces
*/
function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

/* Display a message a in the message_zone 
   msgType (bootstrap type)
         alert-primary (blue)
         alert-secondary (Light gray)
         alert-success (green)
         alert-danger (red)
         alert-warning (yellow)
         alert-info (Blue oil)
         alert-light (white)
         alert-dark (Dark gray)
*/ 
function message (msg, msgType) {
    document.querySelector('#message_div').setAttribute('class',`alert ${msgType}`);
    document.querySelector('#message_div').innerHTML = msg;
    // Efect with delay desepearig
}  

/* Change visibility of the 2 main sections "section#getUserName" (top) and section#postsList (bottom)
*/ 
function setSectionsVisibility (boolS1,boolS2) {
    document.querySelector('section#getUserName').style.visibility = (boolS1?'visible':'hidden');
    document.querySelector('section#postsList').style.visibility = (boolS2?'visible':'hidden');
}


/* Populate the chanel Select with the list of existing chanels
*/ 
function refreshChannelSelection(channelsObj) {
    // Delete previous list
    let sel = document.querySelector('select#channelSelect');
    sel.innerHTML = '';

    // Create None entry
    let opt = document.createElement("option");
    opt.value = 0;
    opt.text = 'None';
    sel.add(opt, null);

    channelsObj.channelList.sort().forEach ( (item,index) => { 
        let opt = document.createElement("option");
        opt.value = item;
        opt.text = item;
        sel.add(opt, null);
    });
}

/* When load page
*/ 
document.addEventListener('DOMContentLoaded', () => {

    // If the user comes for the 1st time or is a recurring user 
    u = localStorage.getItem('username'); 
    if(!u || u === null || u === '') {
        setSectionsVisibility (true,false);
    } else {
        document.querySelector('#usernameText').innerHTML = u;
        setSectionsVisibility (false,true);
    }

    // Recover channels list if exists or create a new one - And update select
    let channelsStr = localStorage.getItem('channelList');
    // If the channel list does not exist, the create it
    if (!channelsStr)
        channelsStr = '{ "channelList" : [] }';
    var channelsObj = JSON.parse(channelsStr);
    refreshChannelSelection(channelsObj);


    // Click button to login an user
    document.querySelector('#loginButton').onclick = () => {
        let usr = document.querySelector('#usernameField').value;
        if (usr) {
            document.querySelector('div#usernameText').innerHTML = usr;
            document.querySelector('div#message_div').innerHTML = "User logged successfully";
            setSectionsVisibility (false,true);
            // Log User
            localStorage.setItem('username',usr);
        } else // No user
            message ("Log in failed - Please type your user name", "alert-danger");
    }

    // Click button to logout a user
    document.querySelector('#logoutButton').onclick = () => {
        localStorage.setItem('username','');
        document.querySelector('div#usernameText').innerHTML = "";
        setSectionsVisibility (true,false);
    }

    // Click button to CREATE non existing CHANNEL
    document.querySelector('#createChannelButton').onclick = () => {

        let c = document.querySelector('#channelField').value;
        c = camelize (c);
        let exists = channelsObj.channelList.includes(c)
        if (!c) {
            message ("Channel name required. Please type a channel name.","alert-warning");
        } else if (c && exists) {
            message ("Channel name already exists. Please type a different channel name.","alert-danger");
        } else if (c && !exists) {    
            channelsObj.channelList.push (c); 
            // save channels list
            localStorage.setItem('channelList',JSON.stringify(channelsObj));
            refreshChannelSelection(channelsObj);
            message (`New channel "${c}" successfully created.`,"alert-success");
        }
    }

    // Change Selector to SELECT a CHANNEL
    document.querySelector('select#channelSelect').onchange = () => {
        let  c = document.querySelector('select#channelSelect').value;
        document.querySelector('div#Post').innerHTML = c;
    }

    // Click button to DELETE existing CHANNEL
    document.querySelector('#deleteChannelButton').onclick = () => {
        let  c = document.querySelector('select#channelSelect').value;
        if (c == 0) // None entry
            message ("Nothing to delete. Please select a channel.","alert-warning");
        else {
            // Delete a value from channel list in channel object
            channelsObj.channelList = channelsObj.channelList.filter(item => item !== c);
            // save channels list
            localStorage.setItem('channelList',JSON.stringify(channelsObj));
            refreshChannelSelection(channelsObj);
            message (`Channel "${c}" successfully deleted.`,"alert-success");
        }
    }

});

