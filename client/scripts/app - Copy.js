// YOUR CODE HERE:
// http://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
function escapeHtml(unsafe) {
    if (!unsafe) {
        return unsafe;
    }
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace("/'/g", "&#039;");
 }

var app = {
};

app._rooms = ["New Room..."];

app._user = window.location.search.substring(1).split("=")[1];
app._lastCreated = '2015-02-17T00:50:32.494Z';
app._friends = [];

app.init = function() {
    $('.dropdown').change(app.onRoomFilter.bind(this));
    $('.chat-send').click(app.send.bind(this));
    $('.create-room').click(app.onCreateRoom.bind(this));
//    $('.user-name').click(app.toggleFriend.bind(this));

    var drop_content = _.first($('.dropdown'));
    var $menuStr = $('<option value="New Room"> New Room... </option>');
    $menuStr.appendTo(drop_content);
    _.each($('.newchat'), function (obj) {
        obj.hidden = false;
    });
    _.each($('.newroom'), function (obj) {
        obj.hidden = true;
    });
    
    setInterval(this.fetch.bind(this), 2000);

    this.fetch();
    return true; 
};

app.onRoomFilter = function () {
    var dropdownmenu = _.first($('.dropdown'));
    if (dropdownmenu.value === 'New Room') {
        _.each($('.newchat'), function (obj) {
            obj.hidden = true;
        });
        _.each($('.newroom'), function (obj) {
            obj.hidden = false;
        });
    }
    else {
        _.each($('.newchat'), function (obj) {
            obj.hidden = false;
        });
        _.each($('.newroom'), function (obj) {
            obj.hidden = true;
        });
    }
    this.fetch();    
}

app.onCreateRoom = function () {
    _.each($('.newchat'), function (obj) {
        obj.hidden = false;
    });
    _.each($('.newroom'), function (obj) {
        obj.hidden = true;
         });
    
    var nameinput = _.first($('.roomname'));
    if (!nameinput) {
        return;
    }
    this.createRoom(nameinput.value);
    nameinput.value = '';
}

app.createRoom = function(name) {
    this._rooms.push(name);
    var dropdownmenu = _.first($('.dropdown'));
    var $menuStr = $('<option value="' + name +'">' + name + '</option>');
    $menuStr.appendTo(dropdownmenu);
    dropdownmenu.selectedIndex = dropdownmenu.length-1;
}

app.toggleFriend = function(e) {
    e = e || window.event;
    e = e.target || e.srcElement;
    if (!e) {
        return;
    }
    var uname = e.text.split('@')[1];
    if (!uname) {
        return;
    }
    var idx = _.indexOf(app._friends, uname); 
    if (idx === -1) {
        app._friends.push(uname);
    }
    else {
        app._friends.splice(idx, 1);
    }

    this.fetch();    
}

app.send = function() {
    var self = this;
    var text = _.first($('.chat-message')).value;
    var drop_content = _.first($('.dropdown'));
    var selectedRoom = drop_content[drop_content.selectedIndex].label;

    var message = {
          username: this._user,
          text: text,
          roomname: selectedRoom
    };

    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
          self.fetch();
          _.first($('.chat-message')).value = '';  
//        console.log('chatterbox: Message sent. Data: ', data);
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message. Error: ', data);
      }
    });

}

app.fetch = function() {
    var self = this;
    var where = {
      createdAt: {
        '$gt': this.lastCreated
      }
    };
    // extend where defaults
    /*
    var drop_content = _.first($('.dropdown'));
    var selectedRoom = drop_content[drop_content.selectedIndex].value;
    if (selectedRoom !== undefined) {
      _.extend(where, {roomname: selectedRoom});
    }
    */

    var data = {
      order: '-createdAt'
    };

    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'GET',
      data: data,
      contentType: 'application/json',
      success: function (gdata) {
        var messages = gdata.results;
        self.displayMessages(messages);
      },
      error: function (gdata) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message. Error: ', gdata);
      }
    }); // ajax


};


app.displayMessages = function(messages) {
    var drop_content = _.first($('.dropdown'));
    var selectedRoom = drop_content.selectedIndex >= 0 ? drop_content[drop_content.selectedIndex].value : undefined;
    var chats = $('#chats');
    chats.html('');

    for (var i=0; i<messages.length; i++) {
        var msg = messages[i];
        var username = escapeHtml(msg.username);
        var roomname = escapeHtml(msg.roomname);
        var friendclass = _.contains(this._friends, username) ? ' friendchats' : '';
        this._lastCreated = msg.createdAt;
        if (roomname && roomname.length > 0 && !_.contains(this._rooms, roomname)) {
            this.createRoom(roomname);
        }

        if (selectedRoom === roomname /* || selectedRoom === "all" */ ) {
            var divstr = '<div>';
            divstr += '<a onclick="app.toggleFriend()" class="user-name' + friendclass + '">@' + username + '</a> <br>';
            var text = escapeHtml(msg.text) || "No message" ;
            divstr += '<a class="chattext' + friendclass + '">' + text + '</a></div><br>';
            /*
            var chatStr = '@' + username + ":" + "<br>" + text + "<br>";
            var $str = $('<a classname="uname">' + chatStr + '</a><br>');
            $str.appendTo(chats);
            */
            var $div = $(divstr);
            $div.appendTo(chats);
        }
    }
    
};

 $(document).ready(function(){ 

    app.init();


 });


