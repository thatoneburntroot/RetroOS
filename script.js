
let topZ = 20;
const windows = [...document.querySelectorAll('.window')];
const minimized = new Set();
let computerPoweredOn = false;

function arrangeWindows(){
    const d=document.getElementById('desktop');
    const layouts=d.clientWidth>=1050?[['browser',105,20],['notepad',525,20],['files',945,20],['ide',200,320],['readme',730,320]]:[['browser',100,20],['notepad',500,20],['files',100,310],['ide',500,310],['readme',250,570]];
    layouts.forEach(([id,x,y])=>{const w=document.getElementById(id);if(w&&w.dataset.userMoved!=='1'&&w.dataset.maximized!=='1'){w.style.left=x+'px';w.style.top=y+'px';}});
}
function bringToFront(w){topZ++;w.style.zIndex=topZ;windows.forEach(x=>x.querySelector('.titlebar')?.classList.toggle('inactive',x!==w));refreshTasks();}
function openWindow(id){if(!computerPoweredOn)return;const w=document.getElementById(id);if(!w)return;w.style.display='block';minimized.delete(id);bringToFront(w);}
function closeWindow(id){const w=document.getElementById(id);if(!w)return;w.style.display='none';minimized.delete(id);if(id==='snake')stopSnake();refreshTasks();}
function minimizeWindow(id){const w=document.getElementById(id);if(!w)return;w.style.display='none';minimized.add(id);refreshTasks();}
function maximizeWindow(id){const w=document.getElementById(id);if(!w)return;if(w.dataset.maximized==='1'){w.style.left=w.dataset.left;w.style.top=w.dataset.top;w.style.width=w.dataset.width;w.style.height=w.dataset.height;w.dataset.maximized='0';}else{w.dataset.left=w.style.left;w.dataset.top=w.style.top;w.dataset.width=w.style.width;w.dataset.height=w.style.height;w.style.left='5px';w.style.top='5px';w.style.width='calc(100% - 10px)';w.style.height='calc(100% - 50px)';w.dataset.maximized='1';}bringToFront(w);}
function refreshTasks(){const t=document.getElementById('tasks');if(!t)return;t.innerHTML='';windows.forEach(w=>{if(w.style.display==='none'&&!minimized.has(w.id))return;const b=document.createElement('button');b.className='task';b.textContent=w.querySelector('.titlebar span')?.textContent||w.id;b.onclick=()=>{if(w.style.display==='none'){w.style.display='block';minimized.delete(w.id);}bringToFront(w);};if(parseInt(w.style.zIndex)===topZ&&w.style.display!=='none')b.classList.add('active');t.appendChild(b);});}

windows.forEach(w=>{const title=w.querySelector('.titlebar');title?.addEventListener('mousedown',e=>{if(e.target.classList.contains('wbtn'))return;bringToFront(w);if(w.dataset.maximized==='1')return;w.dataset.userMoved='1';const sx=e.clientX,sy=e.clientY,sl=w.offsetLeft,st=w.offsetTop;const move=ev=>{const d=document.getElementById('desktop'),maxL=Math.max(0,d.clientWidth-w.offsetWidth-2),maxT=Math.max(0,d.clientHeight-40-w.offsetHeight-2);w.style.left=Math.max(0,Math.min(maxL,sl+ev.clientX-sx))+'px';w.style.top=Math.max(0,Math.min(maxT,st+ev.clientY-sy))+'px';};const stop=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',stop);};document.addEventListener('mousemove',move);document.addEventListener('mouseup',stop);});w.addEventListener('mousedown',()=>bringToFront(w));});

function toggleStart(){if(!computerPoweredOn)return;document.getElementById('startMenu').classList.toggle('open');}
document.addEventListener('mousedown',e=>{if(!e.target.closest('#startMenu')&&!e.target.closest('.start'))document.getElementById('startMenu')?.classList.remove('open');});
function escapeHtml(text){return String(text).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
function searchWebsite(){const value=document.getElementById('url').value.trim();document.getElementById('browserPage').innerHTML=`<div class=\"unavailable\"><h2>Website unavailable</h2><p>The website is down or unavailable.</p><p style=\"font-size:11px\">${escapeHtml(value)}</p></div>`;}

const FILE_KEY='retroos-files';
let retroFiles=[];
try{retroFiles=JSON.parse(localStorage.getItem(FILE_KEY)||'[]');}catch(e){retroFiles=[];}
if(!Array.isArray(retroFiles))retroFiles=[];
function saveFileStore(){localStorage.setItem(FILE_KEY,JSON.stringify(retroFiles));}
function safeFileName(name,ext){name=String(name||'').trim().replace(/[\\/:*?\"<>|]/g,'');if(!name)name='Untitled';if(!name.toLowerCase().endsWith(ext))name+=ext;return name;}
function getFile(name){return retroFiles.find(f=>f.name.toLowerCase()===name.toLowerCase());}
function createOrSaveFile(name,content,type){const ext=type==='html'?'.html':'.txt';name=safeFileName(name,ext);let f=getFile(name);if(f){f.content=content;f.type=type;f.modified=Date.now();}else retroFiles.push({name,content,type,modified:Date.now()});saveFileStore();renderDocuments();return name;}

function newNotepadFile(){document.getElementById('notepadName').value='Untitled.txt';document.querySelector('#notepad .notepad').value='';document.getElementById('notepad').dataset.currentFile='';document.querySelector('#notepad .titlebar span').textContent='Notepad - Untitled.txt';document.querySelector('#notepad .notepad').focus();}
function saveNotepadFile(){const name=createOrSaveFile(document.getElementById('notepadName').value,document.querySelector('#notepad .notepad').value,'text');document.getElementById('notepadName').value=name;document.getElementById('notepad').dataset.currentFile=name;document.querySelector('#notepad .titlebar span').textContent='Notepad - '+name;}
function newIDEFile(){document.getElementById('ideName').value='Untitled.html';document.getElementById('codeEditor').value='<!DOCTYPE html>\n<html>\n<body>\n\n<h1>Hello RetroOS!</h1>\n\n</body>\n</html>';document.getElementById('ide').dataset.currentFile='';document.querySelector('#ide .titlebar span').textContent='RetroIDE - Untitled.html';document.getElementById('codeEditor').focus();}
function saveIDE(){const name=createOrSaveFile(document.getElementById('ideName').value,document.getElementById('codeEditor').value,'html');document.getElementById('ideName').value=name;document.getElementById('ide').dataset.currentFile=name;document.querySelector('#ide .titlebar span').textContent='RetroIDE - '+name;localStorage.setItem('retroos-ide',document.getElementById('codeEditor').value);}
function runIDE(){const code=document.getElementById('codeEditor').value;const url=URL.createObjectURL(new Blob([code],{type:'text/html'}));window.open(url,'_blank');}
function openRetroFile(name){const f=getFile(name);if(!f)return;if(f.type==='html'||name.toLowerCase().endsWith('.html')){openWindow('ide');document.getElementById('ideName').value=f.name;document.getElementById('codeEditor').value=f.content;document.getElementById('ide').dataset.currentFile=f.name;document.querySelector('#ide .titlebar span').textContent='RetroIDE - '+f.name;}else{openWindow('notepad');document.getElementById('notepadName').value=f.name;document.querySelector('#notepad .notepad').value=f.content;document.getElementById('notepad').dataset.currentFile=f.name;document.querySelector('#notepad .titlebar span').textContent='Notepad - '+f.name;}}
function renderDocuments(){const list=document.getElementById('documentsList');if(!list)return;list.innerHTML='';if(!retroFiles.length){list.innerHTML='<div class=\"empty-documents\">My Documents is empty.</div>';return;}retroFiles.forEach(f=>{const row=document.createElement('div');row.className='retro-file';row.innerHTML=`<span>${f.type==='html'?'💻':'📄'}</span> <span>${escapeHtml(f.name)}</span>`;row.ondblclick=()=>openRetroFile(f.name);list.appendChild(row);});}
function openDocuments(){openWindow('files');document.getElementById('computerRoot').style.display='none';document.getElementById('documentsView').style.display='block';renderDocuments();}
function backToComputer(){document.getElementById('documentsView').style.display='none';document.getElementById('computerRoot').style.display='block';}

function setupFileSystemUI(){
    const note=document.querySelector('#notepad .content');
    if(note&&!document.getElementById('notepadName')){const bar=document.createElement('div');bar.className='file-toolbar';bar.innerHTML='<input id=\"notepadName\" value=\"Untitled.txt\"><button onclick=\"newNotepadFile()\">New</button><button onclick=\"saveNotepadFile()\">Save to My Documents</button>';note.insertBefore(bar,note.querySelector('.notepad'));}
    const ide=document.querySelector('#ide .ide-top');
    if(ide&&!ide.querySelector('.new-file-button')){const b=document.createElement('button');b.className='new-file-button';b.textContent='New';b.onclick=newIDEFile;ide.insertBefore(b,ide.firstChild);const save=ide.querySelector('button[onclick=\"saveIDE()\"]');if(save)save.textContent='Save to My Documents';}
    const files=document.querySelector('#files .content');
    if(files&&!document.getElementById('documentsView')){const root=document.createElement('div');root.id='computerRoot';root.innerHTML=files.innerHTML;files.innerHTML='';files.appendChild(root);root.querySelectorAll('div').forEach(el=>{if(el.textContent.includes('📁 My Documents')){el.style.cursor='pointer';el.ondblclick=openDocuments;}});const docs=document.createElement('div');docs.id='documentsView';docs.style.display='none';docs.innerHTML='<div class=\"documents-header\"><button onclick=\"backToComputer()\">← Back</button> <strong>📁 My Documents</strong></div><div id=\"documentsList\"></div>';files.appendChild(docs);}
    renderDocuments();
}

/* ---------------- SNAKE GAME ---------------- */
let snakeTimer=null;
let snakeRunning=false;
let snakeDirection={x:1,y:0};
let snakeNextDirection={x:1,y:0};
let snakeBody=[];
let snakeFood={x:10,y:10};
let snakeScore=0;
const SNAKE_SIZE=20;
const SNAKE_COLS=20;
const SNAKE_ROWS=15;

function setupSnake(){
    if(document.getElementById('snake'))return;
    const desktop=document.getElementById('desktop');
    if(!desktop)return;
    const win=document.createElement('div');
    win.id='snake';
    win.className='window snake-window';
    win.style.display='none';
    win.style.left='300px';
    win.style.top='180px';
    win.style.width='430px';
    win.innerHTML=`
      <div class="titlebar"><span>Snake - RetroOS Game</span><div><button class="wbtn" onclick="minimizeWindow('snake')">_</button><button class="wbtn" onclick="closeWindow('snake')">×</button></div></div>
      <div class="content snake-content">
        <div class="snake-info"><span>Score: <b id="snakeScore">0</b></span><button onclick="startSnake()">New Game</button></div>
        <canvas id="snakeCanvas" width="400" height="300" tabindex="0"></canvas>
        <div id="snakeMessage" class="snake-message">Press New Game to start</div>
        <div class="snake-controls">Use ↑ ↓ ← → or W A S D</div>
      </div>`;
    desktop.appendChild(win);
    windows.push(win);
    const title=win.querySelector('.titlebar');
    title.addEventListener('mousedown',e=>{
        if(e.target.classList.contains('wbtn'))return;
        bringToFront(win);
        if(win.dataset.maximized==='1')return;
        win.dataset.userMoved='1';
        const sx=e.clientX,sy=e.clientY,sl=win.offsetLeft,st=win.offsetTop;
        const move=ev=>{const d=document.getElementById('desktop'),maxL=Math.max(0,d.clientWidth-win.offsetWidth-2),maxT=Math.max(0,d.clientHeight-40-win.offsetHeight-2);win.style.left=Math.max(0,Math.min(maxL,sl+ev.clientX-sx))+'px';win.style.top=Math.max(0,Math.min(maxT,st+ev.clientY-sy))+'px';};
        const stop=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',stop);};
        document.addEventListener('mousemove',move);document.addEventListener('mouseup',stop);
    });
    win.addEventListener('mousedown',()=>bringToFront(win));
    const canvas=document.getElementById('snakeCanvas');
    canvas.addEventListener('keydown',handleSnakeKey);
    canvas.addEventListener('click',()=>canvas.focus());
    drawSnake();
}

function openSnake(){if(!computerPoweredOn)return;setupSnake();openWindow('snake');document.getElementById('snakeCanvas').focus();}
function startSnake(){
    setupSnake();
    clearInterval(snakeTimer);
    snakeRunning=true;
    snakeScore=0;
    snakeDirection={x:1,y:0};
    snakeNextDirection={x:1,y:0};
    snakeBody=[{x:8,y:7},{x:7,y:7},{x:6,y:7}];
    placeSnakeFood();
    updateSnakeScore();
    document.getElementById('snakeMessage').textContent='';
    document.getElementById('snakeCanvas').focus();
    drawSnake();
    snakeTimer=setInterval(stepSnake,120);
}
function stopSnake(){clearInterval(snakeTimer);snakeTimer=null;snakeRunning=false;}
function placeSnakeFood(){
    do{snakeFood={x:Math.floor(Math.random()*SNAKE_COLS),y:Math.floor(Math.random()*SNAKE_ROWS)};}while(snakeBody.some(p=>p.x===snakeFood.x&&p.y===snakeFood.y));
}
function updateSnakeScore(){const el=document.getElementById('snakeScore');if(el)el.textContent=snakeScore;}
function handleSnakeKey(e){
    const key=e.key.toLowerCase();
    if(['arrowup','w'].includes(key)&&snakeDirection.y!==1)snakeNextDirection={x:0,y:-1};
    else if(['arrowdown','s'].includes(key)&&snakeDirection.y!==-1)snakeNextDirection={x:0,y:1};
    else if(['arrowleft','a'].includes(key)&&snakeDirection.x!==1)snakeNextDirection={x:-1,y:0};
    else if(['arrowright','d'].includes(key)&&snakeDirection.x!==-1)snakeNextDirection={x:1,y:0};
    else if(key===' '&&!snakeRunning)startSnake();
    else return;
    e.preventDefault();
}
function stepSnake(){
    if(!snakeRunning)return;
    snakeDirection=snakeNextDirection;
    const head=snakeBody[0];
    const newHead={x:head.x+snakeDirection.x,y:head.y+snakeDirection.y};
    if(newHead.x<0||newHead.x>=SNAKE_COLS||newHead.y<0||newHead.y>=SNAKE_ROWS||snakeBody.some(p=>p.x===newHead.x&&p.y===newHead.y)){
        snakeGameOver();return;
    }
    snakeBody.unshift(newHead);
    if(newHead.x===snakeFood.x&&newHead.y===snakeFood.y){snakeScore+=10;updateSnakeScore();placeSnakeFood();}
    else snakeBody.pop();
    drawSnake();
}
function snakeGameOver(){
    stopSnake();
    const msg=document.getElementById('snakeMessage');
    if(msg)msg.textContent='GAME OVER — press New Game or SPACE';
    drawSnake(true);
}
function drawSnake(gameOver=false){
    const canvas=document.getElementById('snakeCanvas');
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#001900';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='#003d00';
    for(let x=0;x<=canvas.width;x+=SNAKE_SIZE){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke();}
    for(let y=0;y<=canvas.height;y+=SNAKE_SIZE){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke();}
    if(snakeFood){ctx.fillStyle='#ff3333';ctx.fillRect(snakeFood.x*SNAKE_SIZE+3,snakeFood.y*SNAKE_SIZE+3,SNAKE_SIZE-6,SNAKE_SIZE-6);}
    snakeBody.forEach((p,i)=>{ctx.fillStyle=i===0?'#66ff66':'#22cc44';ctx.fillRect(p.x*SNAKE_SIZE+2,p.y*SNAKE_SIZE+2,SNAKE_SIZE-4,SNAKE_SIZE-4);});
    if(gameOver){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#ff5555';ctx.font='bold 28px monospace';ctx.textAlign='center';ctx.fillText('GAME OVER',canvas.width/2,canvas.height/2);}
}

function addSnakeDesktopIcon(){
    if(document.getElementById('snakeDesktopIcon'))return;
    const desktop=document.getElementById('desktop');
    if(!desktop)return;
    const icon=document.createElement('div');
    icon.id='snakeDesktopIcon';
    icon.className='desktop-icon snake-icon';
    icon.innerHTML='<div class="icon-image">🐍</div><span>Snake</span>';
    icon.ondblclick=openSnake;
    desktop.appendChild(icon);
}
function addSnakeStartMenu(){
    const menu=document.getElementById('startMenu');
    if(!menu||menu.querySelector('.snake-start-item'))return;
    const item=document.createElement('div');
    item.className='snake-start-item';
    item.style.cssText='padding:8px 12px;cursor:pointer;border-top:1px solid #808080;margin-top:4px;';
    item.textContent='🐍 Snake';
    item.onclick=()=>{menu.classList.remove('open');openSnake();};
    menu.appendChild(item);
}
function setupSnakeUI(){setupSnake();addSnakeDesktopIcon();addSnakeStartMenu();}

function updateClock(){document.getElementById('clock').textContent=new Date().toLocaleTimeString();}setInterval(updateClock,1000);updateClock();

function bootComputer(){const boot=document.getElementById('bootScreen'),text=document.getElementById('bootText');computerPoweredOn=false;windows.forEach(w=>w.style.display='none');boot.classList.remove('hidden','powered-off','crt-off');boot.classList.add('crt-on');boot.style.transform='';boot.style.color='#00ff66';text.innerHTML='';const lines=['RETROOS BIOS v1.98','','Memory Test ............ OK','Checking Keyboard ...... OK','Detecting Hard Drive ... OK','Checking System ........ OK','','Loading RETROOS ........ OK','','Starting system...'];lines.forEach((line,i)=>setTimeout(()=>{const d=document.createElement('div');d.className='boot-line';d.textContent=line;text.appendChild(d);},450+i*220));setTimeout(()=>boot.classList.add('crt-flicker'),2800);setTimeout(()=>{setupFileSystemUI();setupSnakeUI();windows.forEach(w=>{w.style.display='block';w.style.zIndex='10';});document.getElementById('snake').style.display='none';arrangeWindows();topZ=20;refreshTasks();bringToFront(document.getElementById('browser'));computerPoweredOn=true;boot.classList.add('hidden');boot.classList.remove('crt-on','crt-flicker');},3200);}
function powerOff(){if(!computerPoweredOn)return;stopSnake();const boot=document.getElementById('bootScreen'),text=document.getElementById('bootText');computerPoweredOn=false;document.getElementById('startMenu').classList.remove('open');boot.classList.remove('hidden','powered-off','crt-on');boot.style.transform='scaleY(1)';boot.style.color='#00ff66';text.innerHTML='<div class="boot-line">Shutting down RETROOS...</div><div class="boot-line">Saving system settings... OK</div><div class="boot-line">Closing applications... OK</div><div class="boot-line">Powering off...</div>';windows.forEach(w=>w.style.display='none');void boot.offsetWidth;boot.classList.add('crt-off');setTimeout(()=>{boot.classList.remove('crt-off');boot.classList.add('powered-off');boot.style.transform='scaleY(1)';text.innerHTML='<div class="off-power">⏻</div>';},900);}
document.getElementById('bootScreen').addEventListener('click',function(){if(!computerPoweredOn&&this.classList.contains('powered-off')){this.classList.remove('powered-off');bootComputer();}});
window.addEventListener('resize',()=>{if(computerPoweredOn)arrangeWindows();});
windows.forEach(w=>w.style.display='none');setupFileSystemUI();setupSnakeUI();
const oldCode=localStorage.getItem('retroos-ide');if(oldCode)document.getElementById('codeEditor').value=oldCode;
bootComputer();
