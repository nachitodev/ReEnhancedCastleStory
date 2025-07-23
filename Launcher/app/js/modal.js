$(function(){
  const {shell} = require('electron');
  const md5 = require('js-md5');

  function clearErrors() {
    $(".error").css("visibility", "hidden");
    $('.username').css("border", "solid 4px black");
    $('.password').css("border", "solid 4px black");
  }

  function error(msg) {
    $(".error").text(msg).css("visibility", "visible");
    $('.username').css("border", "solid 4px #990004");
    $('.password').css("border", "solid 4px #990004"); 
  }

  function loginSucess(data) {
    $("#myModal").css("display", "none");
    $(".profile p").html("welcome,<span>"+ data.username +"</span>");
    $('.profile').css('display', 'inline-block');
    $('.bottom-nav').css('visibility', 'visible');
    $('.signin').css('display', 'none');
    localStorage['session'] = JSON.stringify(data);
  }

  function login() {
      let params = {
        username : $('.username').val() ? $('.username').val() : null,
        password : $('.password').val() ? md5($('.password').val()) : null,
        remember : $('.remember-me').val() == true ? 1 : null
      }
      if (params.password && params.username) {
        clearErrors();
        $.post( "http://www.castlestory.net/api/web/account/login", params, function( response ) {
          if (response.success == 0) {
            error(response.msg);
          } else {
            response.data.username = params.username;
            loginSucess(response.data);
          }
        }, "json");
      } else {
        error("Username / Password required");
      }
    }

  $( document ).ready(function() {
    let modal = "#myModal";

    // Get the button that opens the modal
    $(".open-modal").click(function(e) {
        $(modal).css("display", "block");
    });

    // Get the <span> element that closes the modal
    $("#modal-close").click(function(e) {
      $(modal).css("display", "none");
    });

    $('.js-open-ext-link').on('click', function (e) {
      e.preventDefault();
      shell.openExternal(e.currentTarget.href);
    });

    $(".input-signin").click(function(e) {
      login();
    });

    // When the user clicks anywhere outside of the modal, close it
    $(window).click(function(event) {
        if (event.target == $('#myModal')[0]) {
            $(modal).css("display", "none");
        }
    });

    $(document).keydown(function(e) {
      // Close modal when escape is pressed
        if (e.keyCode == 27) { 
          $(modal).css("display", "none");
        } else if (e.keyCode == 13) { // Login if enter pressed
          login();
        }
    });
  });
});