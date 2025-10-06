/* ==== Index ===== */
function initIndex(){
    // === Neon Heart WebGL ===
    var canvas=document.getElementById("canvas");
    var gl=canvas.getContext("webgl");
    function resizeCanvas(){
      canvas.width=window.innerWidth; canvas.height=window.innerHeight;
      gl.viewport(0,0,canvas.width,canvas.height);
      if(widthHandle) gl.uniform1f(widthHandle,canvas.width);
      if(heightHandle) gl.uniform1f(heightHandle,canvas.height);
    }
    window.addEventListener('resize',resizeCanvas);

    var time=0.0;
    var vertexSource=`attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}`;
    var fragmentSource=`precision highp float;
    uniform float width;uniform float height;uniform float time;
    vec2 resolution=vec2(width,height);
    #define POINT_COUNT 8
    vec2 points[POINT_COUNT];
    const float speed=-0.5;const float len=0.25;
    float intensity=1.3;float radius=0.008;
    float sdBezier(vec2 pos,vec2 A,vec2 B,vec2 C){vec2 a=B-A;vec2 b=A-2.0*B+C;vec2 c=a*2.0;vec2 d=A-pos;float kk=1.0/dot(b,b);float kx=kk*dot(a,b);float ky=kk*(2.0*dot(a,a)+dot(d,b))/3.0;float kz=kk*dot(d,a);float res=0.0;float p=ky-kx*kx;float p3=p*p*p;float q=kx*(2.0*kx*kx-3.0*ky)+kz;float h=q*q+4.0*p3;if(h>=0.0){h=sqrt(h);vec2 x=(vec2(h,-h)-q)/2.0;vec2 uv=sign(x)*pow(abs(x),vec2(1.0/3.0));float t=uv.x+uv.y-kx;t=clamp(t,0.0,1.0);vec2 qos=d+(c+b*t)*t;res=length(qos);}else{float z=sqrt(-p);float v=acos(q/(p*z*2.0))/3.0;float m=cos(v);float n=sin(v)*1.732050808;vec3 t=vec3(m+m,-n-m,n-m)*z-kx;t=clamp(t,0.0,1.0);vec2 qos=d+(c+b*t.x)*t.x;float dis=dot(qos,qos);res=dis;qos=d+(c+b*t.y)*t.y;dis=dot(qos,qos);res=min(res,dis);qos=d+(c+b*t.z)*t.z;dis=dot(qos,qos);res=min(res,dis);res=sqrt(res);}return res;}
    vec2 getHeartPosition(float t){return vec2(16.0*sin(t)*sin(t)*sin(t),-(13.0*cos(t)-5.0*cos(2.0*t)-2.0*cos(3.0*t)-cos(4.0*t)));}
    float getGlow(float dist,float radius,float intensity){return pow(radius/dist,intensity);}
    float getSegment(float t,vec2 pos,float offset,float scale){for(int i=0;i<POINT_COUNT;i++){points[i]=getHeartPosition(offset+float(i)*len+fract(speed*t)*6.28);}vec2 c=(points[0]+points[1])/2.0;vec2 c_prev;float dist=10000.0;for(int i=0;i<POINT_COUNT-1;i++){c_prev=c;c=(points[i]+points[i+1])/2.0;dist=min(dist,sdBezier(pos,scale*c_prev,scale*points[i],scale*c));}return max(0.0,dist);}
    void main(){vec2 uv=gl_FragCoord.xy/resolution.xy;float ratio=resolution.x/resolution.y;vec2 centre=vec2(0.5,0.5);vec2 pos=centre-uv;pos.y/=ratio;float scale=0.00004*height;float t=time;float dist=getSegment(t,pos,0.0,scale);float glow=getGlow(dist,radius,intensity);vec3 col=vec3(0.0);col+=10.0*vec3(smoothstep(0.003,0.001,dist));col+=glow*vec3(1.0,0.05,0.3);dist=getSegment(t,pos,3.4,scale);glow=getGlow(dist,radius,intensity);col+=10.0*vec3(smoothstep(0.003,0.001,dist));col+=glow*vec3(0.1,0.4,1.0);col=1.0-exp(-col);col=pow(col,vec3(0.4545));gl_FragColor=vec4(col,1.0);} `;

    function compileShader(src,type){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(s);return s;}
    var vertexShader=compileShader(vertexSource,gl.VERTEX_SHADER);
    var fragmentShader=compileShader(fragmentSource,gl.FRAGMENT_SHADER);
    var program=gl.createProgram();
    gl.attachShader(program,vertexShader);
    gl.attachShader(program,fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    var vertexData=new Float32Array([-1,1,-1,-1,1,1,1,-1]);
    var vertexBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,vertexData,gl.STATIC_DRAW);

    var positionHandle=gl.getAttribLocation(program,"position");
    gl.enableVertexAttribArray(positionHandle);
    gl.vertexAttribPointer(positionHandle,2,gl.FLOAT,false,2*4,0);

    var timeHandle=gl.getUniformLocation(program,"time");
    var widthHandle=gl.getUniformLocation(program,"width");
    var heightHandle=gl.getUniformLocation(program,"height");
    resizeCanvas();
    gl.uniform1f(widthHandle,canvas.width);
    gl.uniform1f(heightHandle,canvas.height);

    var lastFrame=Date.now();
    function draw(){
      var now=Date.now();time+=(now-lastFrame)/1000;lastFrame=now;
      gl.uniform1f(timeHandle,time);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      requestAnimationFrame(draw);
    }
    draw();
}
/* ==== MESSAGE ==== */
function initMessage(){
    // === Neon Heart Background sama kayak sebelumnya ===
    var canvas=document.getElementById("canvas");
    var gl=canvas.getContext("webgl");
    function resizeCanvas(){
      canvas.width=window.innerWidth; 
      canvas.height=window.innerHeight;
      gl.viewport(0,0,canvas.width,canvas.height);
      if(widthHandle) gl.uniform1f(widthHandle,canvas.width);
      if(heightHandle) gl.uniform1f(heightHandle,canvas.height);
    }
    window.addEventListener('resize',resizeCanvas);

    var time=0.0;
    var vertexSource=`attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}`;
    var fragmentSource=`precision highp float;
    uniform float width;uniform float height;uniform float time;
    vec2 resolution=vec2(width,height);
    #define POINT_COUNT 8
    vec2 points[POINT_COUNT];
    const float speed=-0.5;const float len=0.25;
    float intensity=1.3;float radius=0.008;
    float sdBezier(vec2 pos,vec2 A,vec2 B,vec2 C){vec2 a=B-A;vec2 b=A-2.0*B+C;vec2 c=a*2.0;vec2 d=A-pos;
    float kk=1.0/dot(b,b);float kx=kk*dot(a,b);float ky=kk*(2.0*dot(a,a)+dot(d,b))/3.0;float kz=kk*dot(d,a);
    float res=0.0;float p=ky-kx*kx;float p3=p*p*p;float q=kx*(2.0*kx*kx-3.0*ky)+kz;float h=q*q+4.0*p3;
    if(h>=0.0){h=sqrt(h);vec2 x=(vec2(h,-h)-q)/2.0;vec2 uv=sign(x)*pow(abs(x),vec2(1.0/3.0));
    float t=uv.x+uv.y-kx;t=clamp(t,0.0,1.0);vec2 qos=d+(c+b*t)*t;res=length(qos);}
    else{float z=sqrt(-p);float v=acos(q/(p*z*2.0))/3.0;float m=cos(v);float n=sin(v)*1.732050808;
    vec3 t=vec3(m+m,-n-m,n-m)*z-kx;t=clamp(t,0.0,1.0);
    vec2 qos=d+(c+b*t.x)*t.x;float dis=dot(qos,qos);res=dis;
    qos=d+(c+b*t.y)*t.y;dis=dot(qos,qos);res=min(res,dis);
    qos=d+(c+b*t.z)*t.z;dis=dot(qos,qos);res=min(res,dis);
    res=sqrt(res);}return res;}
    vec2 getHeartPosition(float t){return vec2(16.0*sin(t)*sin(t)*sin(t),
    -(13.0*cos(t)-5.0*cos(2.0*t)-2.0*cos(3.0*t)-cos(4.0*t)));}
    float getGlow(float dist,float radius,float intensity){return pow(radius/dist,intensity);}
    float getSegment(float t,vec2 pos,float offset,float scale){
    for(int i=0;i<POINT_COUNT;i++){points[i]=getHeartPosition(offset+float(i)*len+fract(speed*t)*6.28);}
    vec2 c=(points[0]+points[1])/2.0;vec2 c_prev;float dist=10000.0;
    for(int i=0;i<POINT_COUNT-1;i++){c_prev=c;c=(points[i]+points[i+1])/2.0;
    dist=min(dist,sdBezier(pos,scale*c_prev,scale*points[i],scale*c));}
    return max(0.0,dist);}
    void main(){vec2 uv=gl_FragCoord.xy/resolution.xy;float ratio=resolution.x/resolution.y;
    vec2 centre=vec2(0.5,0.5);vec2 pos=centre-uv;pos.y/=ratio;
    float scale=0.00004*height;float t=time;
    float dist=getSegment(t,pos,0.0,scale);float glow=getGlow(dist,radius,intensity);
    vec3 col=vec3(0.0);
    col+=10.0*vec3(smoothstep(0.003,0.001,dist));col+=glow*vec3(1.0,0.05,0.3);
    dist=getSegment(t,pos,3.4,scale);glow=getGlow(dist,radius,intensity);
    col+=10.0*vec3(smoothstep(0.003,0.001,dist));col+=glow*vec3(0.1,0.4,1.0);
    col=1.0-exp(-col);col=pow(col,vec3(0.4545));gl_FragColor=vec4(col,1.0);} `;

    function compileShader(src,type){var s=gl.createShader(type);
      gl.shaderSource(s,src);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))
        throw gl.getShaderInfoLog(s);return s;}
    var vertexShader=compileShader(vertexSource,gl.VERTEX_SHADER);
    var fragmentShader=compileShader(fragmentSource,gl.FRAGMENT_SHADER);
    var program=gl.createProgram();
    gl.attachShader(program,vertexShader);
    gl.attachShader(program,fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    var vertexData=new Float32Array([-1,1,-1,-1,1,1,1,-1]);
    var vertexBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,vertexData,gl.STATIC_DRAW);

    var positionHandle=gl.getAttribLocation(program,"position");
    gl.enableVertexAttribArray(positionHandle);
    gl.vertexAttribPointer(positionHandle,2,gl.FLOAT,false,2*4,0);

    var timeHandle=gl.getUniformLocation(program,"time");
    var widthHandle=gl.getUniformLocation(program,"width");
    var heightHandle=gl.getUniformLocation(program,"height");
    resizeCanvas();
    gl.uniform1f(widthHandle,canvas.width);
    gl.uniform1f(heightHandle,canvas.height);

    var lastFrame=Date.now();
    function draw(){
      var now=Date.now();
      time+=(now-lastFrame)/1000;
      lastFrame=now;
      gl.uniform1f(timeHandle,time);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      requestAnimationFrame(draw);
    }
    draw();

    // === Message Typing ===
    const text = `Hai Bestie,

"Selamat ulang tahun, sahabatku tersayang 🌸
Hari ini, 16 Desember, selalu jadi hari yang aku tunggu, karena di tanggal inilah seseorang yang begitu baik, tulus, dan berharga dalam hidupku dilahirkan. Aku bersyukur banget bisa punya sahabat sepertimu, yang selalu ada dalam suka maupun duka.

Semoga di usia barumu ini, kamu diberi kesehatan yang tidak pernah putus, kebahagiaan yang tulus, rezeki yang lancar, dan kekuatan untuk terus meraih semua mimpi yang kamu perjuangkan. Jangan pernah ragu dengan dirimu sendiri, karena aku percaya kamu bisa mencapai semua hal yang kamu impikan 🌟

Terima kasih sudah menjadi bagian penting dalam hidupku, yang selalu bisa bikin aku tertawa, menguatkan aku saat terpuruk, dan memberikan warna dalam hari-hariku. Semoga persahabatan kita selalu awet, penuh kebahagiaan, dan tidak pernah pudar seiring waktu 🤍✨"

I love you :3`;

    const messageEl = document.getElementById("message");
    const skipBtn = document.getElementById("skipBtn");
    const nextBtn = document.getElementById("nextBtn");
    const backBtn = document.getElementById("backBtn");

    let index = 0;
    let speed = 30;
    let typingInterval;

    function typeWriter() {
      if (index < text.length) {
        messageEl.textContent += text.charAt(index);
        index++;
      } else {
        clearInterval(typingInterval);
        finishTyping();
      }
    }

    function startTyping() {
      typingInterval = setInterval(typeWriter, speed);
    }

    function skipTyping() {
      clearInterval(typingInterval);
      messageEl.textContent = text;
      finishTyping();
    }

    function finishTyping() {
      skipBtn.style.display = "none";
      nextBtn.style.opacity = "1";
      nextBtn.style.pointerEvents = "auto";
    }

    skipBtn.addEventListener("click", skipTyping);
    nextBtn.addEventListener("click", () => window.location.href = "../html/gallery.html");
    backBtn.addEventListener("click", () => window.location.href = "../index.html");

    startTyping();
}
/* ==== GALLERY ==== */
function initGallery(){
    // Neon Heart Background
    var canvas=document.getElementById("canvas");
    var gl=canvas.getContext("webgl");
    function resizeCanvas(){
      canvas.width=window.innerWidth; canvas.height=window.innerHeight;
      gl.viewport(0,0,canvas.width,canvas.height);
      if(widthHandle) gl.uniform1f(widthHandle,canvas.width);
      if(heightHandle) gl.uniform1f(heightHandle,canvas.height);
    }
    window.addEventListener('resize',resizeCanvas);

    var time=0.0;
    var vertexSource=`attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}`;
    var fragmentSource=`precision highp float;
    uniform float width;uniform float height;uniform float time;
    vec2 resolution=vec2(width,height);
    #define POINT_COUNT 8
    vec2 points[POINT_COUNT];
    const float speed=-0.5;const float len=0.25;
    float intensity=1.3;float radius=0.008;
    float sdBezier(vec2 pos,vec2 A,vec2 B,vec2 C){vec2 a=B-A;vec2 b=A-2.0*B+C;vec2 c=a*2.0;vec2 d=A-pos;float kk=1.0/dot(b,b);float kx=kk*dot(a,b);float ky=kk*(2.0*dot(a,a)+dot(d,b))/3.0;float kz=kk*dot(d,a);float res=0.0;float p=ky-kx*kx;float p3=p*p*p;float q=kx*(2.0*kx*kx-3.0*ky)+kz;float h=q*q+4.0*p3;if(h>=0.0){h=sqrt(h);vec2 x=(vec2(h,-h)-q)/2.0;vec2 uv=sign(x)*pow(abs(x),vec2(1.0/3.0));float t=uv.x+uv.y-kx;t=clamp(t,0.0,1.0);vec2 qos=d+(c+b*t)*t;res=length(qos);}else{float z=sqrt(-p);float v=acos(q/(p*z*2.0))/3.0;float m=cos(v);float n=sin(v)*1.732050808;vec3 t=vec3(m+m,-n-m,n-m)*z-kx;t=clamp(t,0.0,1.0);vec2 qos=d+(c+b*t.x)*t.x;float dis=dot(qos,qos);res=dis;qos=d+(c+b*t.y)*t.y;dis=dot(qos,qos);res=min(res,dis);qos=d+(c+b*t.z)*t.z;dis=dot(qos,qos);res=min(res,dis);res=sqrt(res);}return res;}
    vec2 getHeartPosition(float t){return vec2(16.0*sin(t)*sin(t)*sin(t),-(13.0*cos(t)-5.0*cos(2.0*t)-2.0*cos(3.0*t)-cos(4.0*t)));}
    float getGlow(float dist,float radius,float intensity){return pow(radius/dist,intensity);}
    float getSegment(float t,vec2 pos,float offset,float scale){for(int i=0;i<POINT_COUNT;i++){points[i]=getHeartPosition(offset+float(i)*len+fract(speed*t)*6.28);}vec2 c=(points[0]+points[1])/2.0;vec2 c_prev;float dist=10000.0;for(int i=0;i<POINT_COUNT-1;i++){c_prev=c;c=(points[i]+points[i+1])/2.0;dist=min(dist,sdBezier(pos,scale*c_prev,scale*points[i],scale*c));}return max(0.0,dist);}
    void main(){vec2 uv=gl_FragCoord.xy/resolution.xy;float ratio=resolution.x/resolution.y;vec2 centre=vec2(0.5,0.5);vec2 pos=centre-uv;pos.y/=ratio;float scale=0.00004*height;float t=time;float dist=getSegment(t,pos,0.0,scale);float glow=getGlow(dist,radius,intensity);vec3 col=vec3(0.0);col+=10.0*vec3(smoothstep(0.003,0.001,dist));col+=glow*vec3(1.0,0.05,0.3);dist=getSegment(t,pos,3.4,scale);glow=getGlow(dist,radius,intensity);col+=10.0*vec3(smoothstep(0.003,0.001,dist));col+=glow*vec3(0.1,0.4,1.0);col=1.0-exp(-col);col=pow(col,vec3(0.4545));gl_FragColor=vec4(col,1.0);} `;

    function compileShader(src,type){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(s);return s;}
    var vertexShader=compileShader(vertexSource,gl.VERTEX_SHADER);
    var fragmentShader=compileShader(fragmentSource,gl.FRAGMENT_SHADER);
    var program=gl.createProgram();
    gl.attachShader(program,vertexShader);
    gl.attachShader(program,fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    var vertexData=new Float32Array([-1,1,-1,-1,1,1,1,-1]);
    var vertexBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,vertexData,gl.STATIC_DRAW);

    var positionHandle=gl.getAttribLocation(program,"position");
    gl.enableVertexAttribArray(positionHandle);
    gl.vertexAttribPointer(positionHandle,2,gl.FLOAT,false,2*4,0);

    var timeHandle=gl.getUniformLocation(program,"time");
    var widthHandle=gl.getUniformLocation(program,"width");
    var heightHandle=gl.getUniformLocation(program,"height");
    resizeCanvas();
    gl.uniform1f(widthHandle,canvas.width);
    gl.uniform1f(heightHandle,canvas.height);

    var lastFrame=Date.now();
    function draw(){
      var now=Date.now();time+=(now-lastFrame)/1000;lastFrame=now;
      gl.uniform1f(timeHandle,time);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      requestAnimationFrame(draw);
    }
    draw();
    
    const startBtn = document.getElementById("startBtn");
    const screen = document.getElementById("screen");
    const nextBtn = document.getElementById("nextBtn");
    const backBtn = document.getElementById("backBtn");

    const photos = [
      "../img/foto-1.jpg",
      "../img/foto-2.jpg",
      "../img/foto-3.jpg",
      "../img/foto-4.jpg",
      "../img/foto-5.jpg"
    ];
    const dateStr = "30/09/25";

    function smoothAutoScroll(target, duration = 3000) {
      const container = screen;
      const start = container.scrollTop;
      const end = target.offsetTop;
      const change = end - start;
      const startTime = performance.now();

      function animateScroll(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        container.scrollTop = start + change * progress;
        if (progress < 1) requestAnimationFrame(animateScroll);
      }
      requestAnimationFrame(animateScroll);
    }

    startBtn.addEventListener("click", () => {
      screen.innerHTML = "";
      let index = 0;
      let firstPhoto = true;

      function processNext() {
        if (index < photos.length) {
          // progress text
          const progress = document.createElement("div");
          progress.style.marginTop = "6px";
          progress.textContent = `Mencetak foto ${index+1} dari ${photos.length}... (${Math.round((index+1)/photos.length*100)}%)`;
          screen.appendChild(progress);

          setTimeout(() => {
            progress.remove();

            // foto
            const div = document.createElement("div");
            div.className = "photo";
            div.innerHTML = `
              <img src="${photos[index]}">
              #${index+1}<br>
              <span style="color:#ff0">${dateStr}</span>
            `;
            screen.appendChild(div);

            setTimeout(() => {
              div.classList.add("printing");
              if (firstPhoto) {
                document.body.style.alignItems = "flex-start";
                firstPhoto = false;
              }
              smoothAutoScroll(div, 3000); // ⬅ scroll bareng animasi print
            }, 50);

            index++;
            setTimeout(() => processNext(), 1500);
          }, 2000);
        } else {
          const done = document.createElement("div");
          done.style.marginTop = "10px";
          done.textContent = "Selesai mencetak semua foto!";
          screen.appendChild(done);
          smoothAutoScroll(done, 1000);

          // video
          const videoBox = document.createElement("div");
          videoBox.className = "video-box";
          videoBox.innerHTML = `
            <video id="endVideo" controls>
              <source src="../video/video.mp4" type="video/mp4">
            </video>
          `;
          screen.appendChild(videoBox);
          smoothAutoScroll(videoBox, 1000);

          const ulang = document.createElement("div");
          ulang.className = "btn btn-green";
          ulang.textContent = "CETAK ULANG";
          ulang.addEventListener("click", () => location.reload());
          screen.appendChild(ulang);
          smoothAutoScroll(ulang, 1000);

          nextBtn.classList.remove("btn-disabled");
        }
      }

      processNext();
    });

    nextBtn.addEventListener("click", () => {
      if (!nextBtn.classList.contains("btn-disabled")) {
        window.location.href = "../html/music.html";
      }
    });
    backBtn.addEventListener("click", () => { window.location.href = "../index.html"; });
    }

/* ==== MUSIC ==== */
function initMusic(){
    const songs = [
      { title: "Bernadette", artist: "IAMX", src: "../music/music-1.mp3", duration: "5:22", cover: "../img/img-1.jpeg" },
      { title: "Est-ce que tu m_aimes - Pilule bleue", artist: "GIMS", src: "../music/music-2.mp3", duration: "3:56", cover: "../img/img-2.jpeg" },
      { title: "Secret Love Song", artist: "Little Mix", src: "../music/music-3.mp3", duration: "4:09", cover: "../img/img-3.jpeg" },
      { title: "Divine", artist: "MONJOE", src: "../music/music-4.mp3", duration: "4:09", cover: "../img/img-4.jpeg" },
      { title: "Would You Fall in Love with Me Again", artist: "Jorge Rivera-Herrans", src: "../music/music-5.mp3", duration: "5:45", cover: "../img/img-5.jpeg" }
    ];

    const audio = document.getElementById("audioPlayer");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const seekBar = document.getElementById("seekBar");
    const currentTimeEl = document.getElementById("currentTime");
    const durationEl = document.getElementById("duration");
    const songTitle = document.getElementById("songTitle");
    const songArtist = document.getElementById("songArtist");
    const coverImage = document.getElementById("coverImage");
    const playlistDiv = document.getElementById("playlist");
    const volumeBar = document.getElementById("volumeBar");

    let currentIndex = 0;

    function loadSong(index, autoPlay = false) {
      const song = songs[index];
      audio.src = song.src;
      songTitle.textContent = song.title;
      songArtist.textContent = song.artist;
      coverImage.src = song.cover || "img/music.jpg";
      durationEl.textContent = song.duration;
      renderPlaylist();

      songTitle.classList.remove("scrolling");
      setTimeout(() => {
        if (songTitle.scrollWidth > songTitle.clientWidth) {
          songTitle.classList.add("scrolling");
        }
      }, 100);

      if (autoPlay) {
        audio.onloadeddata = () => {
          audio.play();
          playPauseBtn.textContent = "⏸";
        };
      }
    }

    function renderPlaylist() {
      playlistDiv.innerHTML = "";
      songs.forEach((song, i) => {
        const div = document.createElement("div");
        div.className = "track" + (i === currentIndex ? " active" : "");
        div.dataset.index = i;
        div.innerHTML = `<span>${song.title}</span><span>${song.duration}</span>`;
        div.onclick = () => {
          currentIndex = i;
          loadSong(currentIndex, true);
        };
        playlistDiv.appendChild(div);
      });
    }

    function formatTime(sec) {
      if (isNaN(sec)) return "0:00";
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }

    audio.addEventListener("timeupdate", () => {
      if (!isNaN(audio.duration)) {
        seekBar.value = (audio.currentTime / audio.duration) * 100;
        currentTimeEl.textContent = formatTime(audio.currentTime);
      }
    });

    seekBar.addEventListener("input", () => {
      audio.currentTime = (seekBar.value / 100) * audio.duration;
    });

    playPauseBtn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = "⏸";
      } else {
        audio.pause();
        playPauseBtn.textContent = "▶";
      }
    });

    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + songs.length) % songs.length;
      loadSong(currentIndex, true);
    });

    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % songs.length;
      loadSong(currentIndex, true);
    });

    audio.volume = 0.5;
    volumeBar.addEventListener("input", () => {
      audio.volume = volumeBar.value / 100;
    });

    loadSong(currentIndex);

  // === Neon Heart Background ===
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) alert("WebGL tidak didukung!");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (widthHandle) gl.uniform1f(widthHandle, canvas.width);
    if (heightHandle) gl.uniform1f(heightHandle, canvas.height);
  }
  window.addEventListener("resize", resizeCanvas);

  var time = 0.0;
  var vertexSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }`;
    
  var fragmentSource = `precision highp float;
    uniform float width;
    uniform float height;
    uniform float time;
    vec2 resolution = vec2(width, height);
    #define POINT_COUNT 8
    vec2 points[POINT_COUNT];
    const float speed=-0.5;
    const float len=0.25;
    float intensity=1.3;
    float radius=0.008;

    // === fungsi bezier, heart, glow sama persis ===
    vec2 getHeartPosition(float t){
      return vec2(
        16.0*sin(t)*sin(t)*sin(t),
        -(13.0*cos(t)-5.0*cos(2.0*t)-2.0*cos(3.0*t)-cos(4.0*t))
      );
    }
    float getGlow(float dist,float radius,float intensity){
      return pow(radius/dist,intensity);
    }

    float sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C){
      vec2 a=B-A;
      vec2 b=A-2.0*B+C;
      vec2 c=a*2.0;
      vec2 d=A-pos;
      float kk=1.0/dot(b,b);
      float kx=kk*dot(a,b);
      float ky=kk*(2.0*dot(a,a)+dot(d,b))/3.0;
      float kz=kk*dot(d,a);
      float p=ky-kx*kx;
      float q=kx*(2.0*kx*kx-3.0*ky)+kz;
      float h=q*q+4.0*p*p*p;
      if(h>=0.0){
        h=sqrt(h);
        vec2 x=(vec2(h,-h)-q)/2.0;
        vec2 uv=sign(x)*pow(abs(x),vec2(1.0/3.0));
        float t=uv.x+uv.y-kx;
        t=clamp(t,0.0,1.0);
        vec2 qos=d+(c+b*t)*t;
        return length(qos);
      }
      return 1.0;
    }

    float getSegment(float t,vec2 pos,float offset,float scale){
      for(int i=0;i<POINT_COUNT;i++){
        points[i]=getHeartPosition(offset+float(i)*len+fract(speed*t)*6.28);
      }
      vec2 c=(points[0]+points[1])/2.0;
      vec2 c_prev;
      float dist=10000.0;
      for(int i=0;i<POINT_COUNT-1;i++){
        c_prev=c;
        c=(points[i]+points[i+1])/2.0;
        dist=min(dist,sdBezier(pos,scale*c_prev,scale*points[i],scale*c));
      }
      return max(0.0,dist);
    }

    void main(){
      vec2 uv=gl_FragCoord.xy/resolution.xy;
      float ratio=resolution.x/resolution.y;
      vec2 centre=vec2(0.5,0.5);
      vec2 pos=centre-uv;
      pos.y/=ratio;
      float scale=0.00004*height;
      float t=time;
      float dist=getSegment(t,pos,0.0,scale);
      float glow=getGlow(dist,radius,intensity);
      vec3 col=vec3(0.0);
      col+=glow*vec3(1.0,0.05,0.3);
      dist=getSegment(t,pos,3.4,scale);
      glow=getGlow(dist,radius,intensity);
      col+=glow*vec3(0.1,0.4,1.0);
      gl_FragColor=vec4(col,1.0);
    }`;

  function compileShader(src, type) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
    }
    return s;
  }

  var vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER);
  var fragmentShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER);
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  var vertexData = new Float32Array([-1,1,-1,-1,1,1,1,-1]);
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

  var positionHandle = gl.getAttribLocation(program,"position");
  gl.enableVertexAttribArray(positionHandle);
  gl.vertexAttribPointer(positionHandle,2,gl.FLOAT,false,0,0);

  var timeHandle=gl.getUniformLocation(program,"time");
  var widthHandle=gl.getUniformLocation(program,"width");
  var heightHandle=gl.getUniformLocation(program,"height");

  gl.clearColor(0,0,0,1); // Biar hitam default
  resizeCanvas();

  var lastFrame=Date.now();
  function draw(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    var now=Date.now();
    time+=(now-lastFrame)/1000;
    lastFrame=now;
    gl.uniform1f(timeHandle,time);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    requestAnimationFrame(draw);
  }
  draw();
}