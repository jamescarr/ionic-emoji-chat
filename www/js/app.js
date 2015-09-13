// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
function message_template() {
  var templates = {
    true: Handlebars.compile("<div class='contained-message row'><div class='col-15'><img src='http://hidden-peak-3397.herokuapp.com/images/avatars/{{ user }}.png' class='avatar'></div><div class='col-75 message even'>{{{ msg }}}</div></div>"),
    false: Handlebars.compile("<div class='contained-message row'><div class='odd message col-75'>{{{ msg }}}</div><div class='col-15'><img src='http://hidden-peak-3397.herokuapp.com/images/avatars/{{ user }}.png' class='avatar'></div></div>"),
  }
  var current_user = null;
  var current_template = false;

  return function(user) {
    if (current_user != user) {
      current_user = user;
      current_template = !current_template;
    }
    return templates[current_template];
  }
}

function adjust_scroll() {
  var height = 0;
  $('#messages div').each(function() {
    height += $(this).height();

  });
  console.log(height);
  $('ion-content').animate({scrollTop: height-100});
}

function ChatStream() {
  this.msg_template = message_template()
};

ChatStream.prototype.append = function(message) {
  var block = this.msg_template(message.user)(message);

  $('#messages').append($(block));
  adjust_scroll();
}


angular.module('starter', ['ionic'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    var socket = io('http://hidden-peak-3397.herokuapp.com:80/');
    var buffer = [];
    var user   = null;
    var stream = new ChatStream();

    $(".convert-emoji").each(function() {
      var self = this;
      emojis.forEach(function(emoji) {
        var fragment = $(' <a href="#" data-emoji="'+emoji+'">'+emoji+'</a>\n');
        $(self).append(fragment);
      });
      var original = $(this).html();
      console.log(original);
      // use .shortnameToImage if only converting shortnames (for slightly better performance)
      var converted = emojione.toImage(original);
      $(this).html(converted);
    });

    $('ion-option-button').click(function(){
      var text = buffer.join(' ');
      buffer = [];
      $('#curm span').html('')
      socket.emit('/chat/message', {msg: text, user: user});
      return false;
    });

    socket.on('/user/assign', function(avatar) {
      user = avatar;
    });

    socket.on('/user/join', function(avatar) {
      if (user === avatar) return;
      var msg = {user: avatar, msg: 'joined' }
      stream.append(msg);
    });

    socket.on('/chat/message', function(msg){
      msg.msg = emojione.toImage(msg.msg);
      stream.append(msg);
    });

    $('.convert-emoji a').click(function(e) {
      buffer.push($(this).attr('data-emoji'));
      var inflightText = buffer.join(' ')
      $('#curm span').html(emojione.toImage(inflightText))
      return false;
    });

  });
});

var emojis = [
  ':grinning:', ':joy:', ':innocent:', ':yum:', ':smile_cat:', ':heart_eyes_cat:', ':scream_cat:', ':ghost:', ':rose:', ':cow2:', ':horse:', ':dog:', ':whale:', ':monkey_face:', ':star2:', ':pizza:', ':pineapple:', ':cake:'
]
