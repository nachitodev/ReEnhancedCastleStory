$(function(){

  'use strict';

  const electron = require('electron');
  const {shell, app, BrowserWindow} = electron;
  const {spawn} = require('child_process');
  var exec = require('child_process').exec;
  const remote = require('electron').remote;
  const moment = require('moment');
  const storage = require('electron-json-storage');
  const launch = require('child_process').spawn;
  const os = require('os');
  let session = null;
  window.options = null;
  window.lang = navigator.language.substr(0, 2) == 'fr' ? 'fr' : 'en';

  moment().format();

  function init() {
    // if (typeof(localStorage['session']) != "undefined" && localStorage['session'] != "null") {
    //   session = JSON.parse(localStorage['session']);
    //   // User is loggedin
    //   $('.profile').css('display', 'inline-block');
    //   $('.bottom-nav').css('visibility', 'visible');
    //   $('.signin').css('display', 'none');
    //   $(".profile p").html("welcome,<span>"+ session.username +"</span>");
    // } else {
    //   // User is not loggedin
    //   $('.bottom-nav').css('visibility', 'hidden');
    //   $('.profile').css('display', 'none');
    //   $('.signin').css('display', 'inline-block');
    // }
    $('.' + window.lang).show();
  }

  function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
  }

    function LaunchApp(path,width,height,fullscreen,monitor)
  {
    launch(path, ['-screen-width', width, '-screen-height', height,'-screen-fullscreen', fullscreen,'-adapter',monitor],{
      detached: true
      }, (err, stdout, stderr) => {
      console.log(err)
    })
    var app = require('electron').remote.app
    wait(1000);
    app.quit();
  }

  function logout() {
    $.get('http://www.castlestory.net/en/account/signout', function(response){
      localStorage['session'] = null;
      init();
    });
  }

  function initScreenResolution() {

    let resolution = remote.getGlobal('resolution').width + "x" + remote.getGlobal('resolution').height

    if ($('.resolution select  option[value="' + resolution + '"]').length == 0) {
      $('.resolution select').append($('<option>', {text:resolution}));
    }

    if (resolution) {
      $('.resolution select').val(resolution);
    }
  }

  function initScreenSelector() {
    let displays = electron.screen.getAllDisplays();
    if (displays.length > 1) {
      for (let i=2; i <= displays.length; i++) {
        $(".select-wrapper.monitor select").append('<option value=' + i + '>' + i + '</option>');
      }

      if (window.options && window.options.monitor) {
        $(".select-wrapper.monitor select").val(window.options.monitor);
      }
      $(".monitor-selector").show();
    }
  }

  function loadData() {
    initScreenResolution();
    //initScreenSelector();

    storage.get('options', function(error, data) {
      if (error) throw error;

      if (data && data.resolution) {
        $(".resolution select").val(data.resolution);
      }

      if (data && data.monitor) {
        $(".monitor select").val(data.monitor);
      }

      if (data && data.fullscreen) {
        $("#fs-checkbox").addClass('checked');
      }
      else if (data && !data.fullscreen) {
        $("#fs-checkbox").removeClass('checked');
      }
    });

    $('.modal-wrapper').load("views/modal.html");

    if (navigator.onLine) {

      $.get('http://www.castlestory.net/api/web/launcher/get_infos',
      {
        lang:window.lang
      },
      function(response){
        if (response.success !== 1) return;
        /*
        * NEWS
        */

        let major_release = response.data.major_release;
        $('#latest-update-link').attr('href', 'http://www.castlestory.net' + major_release.url);
        $('#lastest-update-version').html('<strong>version '+major_release["meta.version"]+'</strong>');
        $('#latest-update-excerpt').html(major_release.excerpt);

        if (major_release.media[0].distant_id) {
          $(".video-wrapper").html('<iframe width="356" height="200" src="https://www.youtube.com/embed/' + major_release.media[0].distant_id + '?rel=0" frameborder="0" allowfullscreen></iframe>');
        }
        else {
          $(".video-wrapper").html('<img src="' + major_release.media[0].images.launcher_thumb + '" width="356" height="200" />');
        }

        let response_news_data = response.data.news;

        if (response_news_data) {
          $("#minor-update-link").attr('href', 'http://www.castlestory.net' + response_news_data.url);
          $('#minor-update-title').html(response_news_data.title);
          $("#minor-update-excerpt").html(response_news_data.excerpt);
          $('.box.link').show();
        }

        // /*
        // * FORUM POSTS
        // */
        // let response_posts_data = response.data.forums_posts;
        // // <a href="#"><strong>KICKSTARTER BACKERS, YOU SHOULD HAVE A FORUM BADGE NOW. :) -</strong> <em>Shatojon <strong>- 0 reply</strong></em></a>

        // let postHtml = '';
        // for (let i = 0; i < 2 && i < response_posts_data.length; ++i) {
        //   let postsData = response_posts_data[i];
        //   postHtml += '<a href="#"><strong>' + postsData.title + '</strong></a>';
        // }

        // $('.js-banner .js-inner').html(postHtml);
      });
    }

    $('.js-sigin').on('click', function (e) {
      login();
    });

    $('.js-signout').on('click', function (e) {
      logout();
    });
  }

  $('#checkbox-border').click(function(e) {
    if ($('#fs-checkbox').hasClass('checked')) {
      $('#fs-checkbox').removeClass('checked');
    } else {
      $('#fs-checkbox').addClass('checked');
    }
  });

  $('.js-close').click(function(e) {
    var window = remote.getCurrentWindow();
    window.close();
  });

  $('.js-minimize').click(function(e) {
    var window = remote.getCurrentWindow();
    window.minimize();
  });

  $.get('http://www.castlestory.net/api/web/launcher/get_credits',
  {
    lang:window.lang
  },
  function(response){

    $('#credits .content').prepend(response.data['credits']);

    for (var i=0; i<response.data.partners.length; i++) {
      $("#credits .partner-list").append("<img src=" + response.data.partners[i].source_url + " />");
    }
  });

  $('.js-open-credits').click(function(e) {
    e.preventDefault();

    $("#credits .content").removeAttr('style');

    $("#credits").fadeIn();

    $("#credits .js-close-credits").click(function(e) {
      $("#credits").fadeOut(1000);
    });

    $("#credits .js-close-credits").mousedown(function(e) {
      e.stopPropagation();
    });

    $("#credits").mousedown(function(e) {
      $("#credits .content").stop();
    });

    $("#credits").mouseup(function(e) {
      $("#credits .content").stop(true).animate({
        top: -1 * (parseInt($("#credits .content").outerHeight()) - parseInt($("#credits").outerHeight()))
      }, parseInt($("#credits .content").outerHeight()) * 10, "linear", function() {
        $("#credits").delay(2000).fadeOut(1000);
      });
    });

    $("#credits .content").stop(true).delay(1000).animate({
        top: -1 * (parseInt($("#credits .content").outerHeight()) - parseInt($("#credits").outerHeight()))
    }, parseInt($("#credits .content").outerHeight()) * 10, "linear", function() {
      $("#credits").delay(2000).fadeOut(1000);
    });
  });


  $('.js-ext-link').on('click', function (e) {
    e.preventDefault();
    shell.openExternal(e.currentTarget.href);
  });

  $('.play').on('click', function (e) {



    storage.set('options', {
      resolution:$(".select-wrapper.resolution select").val(),
      monitor:$(".select-wrapper.monitor select").val(),
      fullscreen:$("#fs-checkbox").hasClass('checked')
    }, function(error) {
      if (error) throw error;
    });


      var res = $('.resolution select').val().split('x');
      var width = res[0]
      var height = res[1]

      if ($('#fs-checkbox').hasClass('checked')) {
      var fullscreen = 1
    } else {
      var fullscreen = 0
    }
    var monitor = $('.monitor select').val() -1;

    if (os.platform() == "darwin") {
    	console.log("ON EST SUR MAC");
    	LaunchApp(__dirname + '/../../../../../../Castle Story.app/Contents/MacOS/Castle Story', width, height,fullscreen,monitor);
    } else if (os.platform() == "win32") {
        console.log('ON EST SUR WINDOWS');
        LaunchApp(__dirname + '/../../../../Castle Story.exe', width, height,fullscreen,monitor);
    } else if (os.platform() == "linux") {
        console.log("ON EST SUR LINUX");
        LaunchApp(__dirname + '/../../../../Castle Story', width, height,fullscreen,monitor);
    } else {
        console.log("NO SÉ");
        LaunchApp(__dirname + '/../../../../../../Castle Story.app/Contents/MacOS/Castle Story', width, height,fullscreen,monitor);
    }



  });

  init();
  loadData();

});
