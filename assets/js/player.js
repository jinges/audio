var elms = ['backward', 'timer', 'duration','forward', 'progress_box', 'progress', 'progress_state', 'playBtn', 'pauseBtn', 'prevBtn', 'nextBtn', 'playlistBtn','list','rateBtn', 'mask'];
elms.forEach(function(elm) {
  window[elm] = document.getElementById(elm);
});

var Player = function(opt) {
  var playlist = opt.src; 
  this.playlist = playlist;
  this.index = 0;


  playlist.forEach(function(song) {
    var div = document.createElement('li');
    div.className = 'list-song';
    div.innerHTML = song.title;
    div.onclick = function() {
      player.skipTo(playlist.indexOf(song));
    };
    list.querySelector('ul').appendChild(div);
  });
};

Player.prototype = {
  play: function(index){
    var self = this;
    var sound;

    index = typeof index === 'number' ? index : self.index;
    var data = self.playlist[index];

    if(data.howl) {
      sound = data.howl;
    } else {
      sound = data.howl = new Howl({
        src: ['./assets/source/' + data.file + '.mp3'],
        html5: true,
        onplay: function(){
          duration.innerHTML = self.formatTime(Math.round(sound.duration()));
          requestAnimationFrame(self.step.bind(self));
          progress_state.style.display = 'block';
        },
        onload: function(){
          //加载中
        },
        onend: function(){
          self.skip('next');
        },
        onpause: function(){

        },
        onstop: function() {
          // Stop the wave animation.
          progress_state.style.display = 'none';
        },
        onseek: function() {
          // Start upating the progress of the track.
          requestAnimationFrame(self.step.bind(self));
        }
      });
    }

    sound.play();

    if (sound.state() === 'loaded') {
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'block';
    } else {
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'block';
    }

    self.index = index;
  },
  pause: function(){
    var self = this;
    var sound = self.playlist[self.index].howl;

    sound.pause();

    pauseBtn.style.display = 'none';
    playBtn.style.display = 'block';
  },
  skip: function(direction){
    var self = this;

    var index = 0;


    if('prev' == direction) {
      index = self.index - 1;
      if(!index){
        prevBtn.classList.add('none')
      } else {
        prevBtn.classList.remove('none');
        nextBtn.classList.remove('none');
      }
      if(index < 0) {
        return false;
      }
    } else {
      index = self.index + 1;
      if((index + 1) == self.playlist.length){
        nextBtn.classList.add('none');
      } else {
        prevBtn.classList.remove('none');
        nextBtn.classList.remove('none');
      }
      if (index >= self.playlist.length) {
        return false;
      }
    }

    self.skipTo(index);
  },
  skipTo: function(index){
    var self = this;

    if(self.playlist[self.index].howl){
      self.playlist[self.index].howl.stop();
    }

    progress.style.width = '0%';

    self.play(index);
  },
  step: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Determine our current seek position.
    var seek = sound.seek() || 0;
    var pro = (((seek / sound.duration()) * 100) || 0);
    timer.innerHTML = self.formatTime(Math.round(seek));
    progress.style.width =  pro + '%';
    progress_state.style.left = (pro - 10) + '%';

    if (sound.playing()) {
      requestAnimationFrame(self.step.bind(self));
    }
  },
  seek: function(num, type){
    var self = this;
    var sound = self.playlist[self.index].howl;
    var seek = sound.seek() || 0;
    var per = (num + seek);
    var duration = sound.duration();

    
    if(type) {
      per = duration * num;
    } else {
      if(per < 0) {
        per = 0;
      } else if(duration <= per) {
        per = duration;
        sound.stop();
        return false;
      }
    }
    if (sound.playing()) {
      sound.pause();
    }
    sound.seek(per);
    sound.play();
  },
  rate: function(dom){
    var arr = [1,1.5,2];
    var index = dom.getAttribute('rate') * 1;
    var self = this;
    var sound = self.playlist[self.index].howl;

    index = (index + 1) >2? 0: index + 1;
    var rate = arr[index];

   
    if (sound.playing()) {
      sound.rate(rate);
    }

    dom.setAttribute('rate', index);
    dom.innerHTML = rate + 'X';

  },
  togglePlaylist: function() {
    var self = this;
    var display = (list.style.display === 'block') ? 'none' : 'block';

    setTimeout(function() {
      list.style.display = display;
    }, (display === 'block') ? 0 : 200);
    // list.className = (display === 'block') ? 'fadein' : 'fadeout';
    var panel = list.querySelector('.sources');
    if(display === 'block'){
      panel.classList.remove('fadeout');
      panel.classList.add('fadein');
    } else {
      panel.classList.remove('fadein');
      panel.classList.add('fadeout');
    }
  },
  formatTime: function(secs) {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = (secs - minutes * 60) || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }
};

var player = new Player({
  src:[
  {
    title: 'Rave Digger',
    file: 'rave_digger',
    howl: null
  },
  {
    title: '80s Vibe',
    file: '80s_vibe',
    howl: null
  },
  {
    title: 'Running Out',
    file: 'running_out',
    howl: null
  }
],
autoplay: true,});

playBtn.addEventListener('click', function() {
  player.play();
});
pauseBtn.addEventListener('click', function() {
  player.pause();
});
prevBtn.addEventListener('click', function() {
  player.skip('prev');
});
nextBtn.addEventListener('click', function() {
  player.skip('next');
});
backward.addEventListener('click', function() {
  player.seek(-15);
});
forward.addEventListener('click', function() {
  player.seek(15);
});
rateBtn.addEventListener('click', function(e) {
  player.rate(e.target);
});
progress_box.addEventListener('click', function(e) {
  var per = (e.clientX - progress_box.offsetLeft) / parseFloat(progress_box.offsetWidth)
  player.seek(per, true);
});
playlistBtn.addEventListener('click', function(e) {
  player.togglePlaylist();
});
mask.addEventListener('click', function(e) {
  player.togglePlaylist();
});
