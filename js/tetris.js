// ==== WebGL Neon Heart Background ====
var canvas = document.getElementById("bgCanvas");
var gl = canvas.getContext("webgl");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  if (widthHandle) gl.uniform1f(widthHandle, canvas.width);
  if (heightHandle) gl.uniform1f(heightHandle, canvas.height);
}
window.addEventListener('resize', resizeCanvas);

var time = 0.0;
var vertexSource = `attribute vec2 position; void main(){ gl_Position = vec4(position,0.0,1.0); }`;
var fragmentSource = `precision highp float;
uniform float width; uniform float height; uniform float time;
vec2 resolution=vec2(width,height);
#define POINT_COUNT 8
vec2 points[POINT_COUNT];
const float speed=-0.5; const float len=0.25; float intensity=1.3; float radius=0.008;
vec2 getHeartPosition(float t){
  return vec2(16.0*sin(t)*sin(t)*sin(t),-(13.0*cos(t)-5.0*cos(2.0*t)-2.0*cos(3.0*t)-cos(4.0*t)));
}
float getGlow(float dist,float radius,float intensity){return pow(radius/dist,intensity);}
float getSegment(float t,vec2 pos,float offset,float scale){
  for(int i=0;i<POINT_COUNT;i++){points[i]=getHeartPosition(offset+float(i)*len+fract(speed*t)*6.28);}
  vec2 c=(points[0]+points[1])/2.0; vec2 c_prev; float dist=10000.0;
  for(int i=0;i<POINT_COUNT-1;i++){c_prev=c;c=(points[i]+points[i+1])/2.0;
    vec2 a=scale*c_prev,b=scale*points[i],c2=scale*c;
    dist=min(dist,length(mix(mix(a,b,0.5),c2,0.5)-pos));
  } return dist;
}
void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  float ratio=resolution.x/resolution.y;
  vec2 centre=vec2(0.5,0.5); vec2 pos=centre-uv; pos.y/=ratio;
  float scale=0.00004*height; float t=time;
  float dist=getSegment(t,pos,0.0,scale); float glow=getGlow(dist,radius,intensity);
  vec3 col=vec3(0.0); col+=glow*vec3(1.0,0.1,0.3);
  dist=getSegment(t,pos,3.4,scale); glow=getGlow(dist,radius,intensity);
  col+=glow*vec3(0.2,0.4,1.0);
  col=1.0-exp(-col); col=pow(col,vec3(0.4545));
  gl_FragColor=vec4(col,1.0);
}`;

function compileShader(src,type){
  var s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(s); return s;
}
var vertexShader=compileShader(vertexSource,gl.VERTEX_SHADER);
var fragmentShader=compileShader(fragmentSource,gl.FRAGMENT_SHADER);
var program=gl.createProgram();
gl.attachShader(program,vertexShader); gl.attachShader(program,fragmentShader); gl.linkProgram(program); gl.useProgram(program);
var vertexData=new Float32Array([-1,1,-1,-1,1,1,1,-1]);
var vertexBuffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER,vertexData,gl.STATIC_DRAW);
var positionHandle=gl.getAttribLocation(program,"position");
gl.enableVertexAttribArray(positionHandle); gl.vertexAttribPointer(positionHandle,2,gl.FLOAT,false,2*4,0);
var timeHandle=gl.getUniformLocation(program,"time");
var widthHandle=gl.getUniformLocation(program,"width");
var heightHandle=gl.getUniformLocation(program,"height");
resizeCanvas();
var lastFrame=Date.now();
function drawBG(){
  var now=Date.now(); time+=(now-lastFrame)/1000; lastFrame=now;
  gl.uniform1f(timeHandle,time); gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  requestAnimationFrame(drawBG);
}
drawBG();

// ==== Tetris Logic ====
const rows=15, cols=10;
const board=document.getElementById("board");
const scoreEl=document.getElementById("score");
const linesEl=document.getElementById("lines");
const levelEl=document.getElementById("level");
const startBtn=document.getElementById("startBtn");
const galaxyBtn=document.getElementById("galaxyBtn");
const overlay=document.getElementById("overlay");
const finalScore=document.getElementById("finalScore");
const okOverlayBtn=document.getElementById("okOverlayBtn");
const popup=document.getElementById("popup");
const okBtn=document.getElementById("okBtn");

let grid, score=0, lines=0, level=1, interval, currentPiece;

const SHAPES={
  I:[[1,1,1,1]],
  O:[[1,1],[1,1]],
  T:[[0,1,0],[1,1,1]],
  L:[[1,0],[1,0],[1,1]],
  J:[[0,1],[0,1],[1,1]],
  S:[[0,1,1],[1,1,0]],
  Z:[[1,1,0],[0,1,1]]
};

function createGrid(){
  board.innerHTML="";
  grid=Array.from({length:rows},()=>Array(cols).fill(0));
  for(let y=0;y<rows;y++) for(let x=0;x<cols;x++){
    const d=document.createElement("div");
    d.className="cell";
    d.dataset.x=x; d.dataset.y=y;
    board.appendChild(d);
  }
}
function drawGrid(){
  document.querySelectorAll(".cell").forEach(c=>{
    const x=c.dataset.x, y=c.dataset.y;
    c.className="cell"+(grid[y][x]?" filled":"");
  });
  if(currentPiece){
    currentPiece.shape.forEach((row,dy)=>{
      row.forEach((val,dx)=>{
        if(val){
          let x=currentPiece.x+dx, y=currentPiece.y+dy;
          if(y>=0){
            const cell=document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
            if(cell) cell.className="cell filled";
          }
        }
      });
    });
  }
}
function spawnPiece(){
  const keys=Object.keys(SHAPES);
  const shape=SHAPES[keys[Math.floor(Math.random()*keys.length)]];
  currentPiece={shape:shape,x:3,y:0};
  if(!isValidMove(0,0,shape)) gameOver();
}
function isValidMove(dx,dy,newShape=currentPiece.shape){
  for(let y=0;y<newShape.length;y++){
    for(let x=0;x<newShape[y].length;x++){
      if(newShape[y][x]){
        let newX=currentPiece.x+x+dx;
        let newY=currentPiece.y+y+dy;
        if(newX<0||newX>=cols||newY>=rows) return false;
        if(newY>=0 && grid[newY][newX]) return false;
      }
    }
  }
  return true;
}
function placePiece(){
  currentPiece.shape.forEach((row,dy)=>{
    row.forEach((val,dx)=>{
      if(val){
        let x=currentPiece.x+dx, y=currentPiece.y+dy;
        if(y>=0) grid[y][x]=1;
      }
    });
  });
  clearLines();
  spawnPiece();
}
function clearLines(){
  for(let y=rows-1;y>=0;y--){
    if(grid[y].every(c=>c)){
      grid.splice(y,1);
      grid.unshift(Array(cols).fill(0));
      score+=10; lines++;
      if(lines%5===0){ level++; }
      scoreEl.textContent=score;
      linesEl.textContent=lines;
      levelEl.textContent=level;
      clearInterval(interval);
      interval=setInterval(drop,Math.max(100,400-(level-1)*40));
      y++;
    }
  }
}
function rotate(){
  const rotated=currentPiece.shape[0].map((_,i)=>currentPiece.shape.map(r=>r[i]).reverse());
  if(isValidMove(0,0,rotated)) currentPiece.shape=rotated;
}
function drop(){
  if(isValidMove(0,1)) currentPiece.y++;
  else placePiece();
  drawGrid();
}
function startGame(){
  createGrid(); score=0; lines=0; level=1;
  scoreEl.textContent=0; linesEl.textContent=0; levelEl.textContent=1;
  spawnPiece(); clearInterval(interval);
  interval=setInterval(drop,100);
  drawGrid();
  startBtn.style.display="none";
  galaxyBtn.style.display="none";
  overlay.style.display="none";
}
function gameOver(){
  clearInterval(interval);
  finalScore.textContent=score;
  overlay.style.display="flex";
}

createGrid();
drawGrid();

// kontrol
document.getElementById("leftBtn").onclick=()=>{ if(currentPiece && isValidMove(-1,0)) currentPiece.x--; drawGrid(); };
document.getElementById("rightBtn").onclick=()=>{ if(currentPiece && isValidMove(1,0)) currentPiece.x++; drawGrid(); };
document.getElementById("rotateBtn").onclick=()=>{ if(currentPiece) rotate(); drawGrid(); };

// overlay → popup
okOverlayBtn.onclick=()=>{
  overlay.style.display="none";
  popup.style.display="block";
};

// popup → START jadi PLAY AGAIN + Galaxy
okBtn.onclick=()=>{
  popup.style.display="none";
  startBtn.style.display="block";
  startBtn.textContent="PLAY AGAIN";
  galaxyBtn.style.display="block";
};