/* =========================================================
   RETROOS
========================================================= */

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
function closeWindow(id){const w=document.getElementById(id);if(!w)return;w.style.display='none';minimized.delete(id);refreshTasks();}
function minimizeWindow(id){const w=document.getElementById(id);if(!w)return;w.style.display='none';minimized.add(id);refreshTasks();}
function maximizeWindow(id){const w=document.getElementById(id);if(!w)return;if(w.dataset.maximized==='1'){w.style.left=w.dataset.left;w.style.top=w.dataset.top;w.style.width=w.dataset.width;w.style.height=w.dataset.height;w.dataset.maximized='0';}else{w.dataset.left=w.style.left;w.dataset.top=w.style.top;w.dataset.width=w.style.width;w.dataset.height=w.style.height;w.style.left='5px';w.style.top='5px';w.style.width='calc(100% - 10px)';w.style.height='calc(100% - 50px)';w.dataset.maximized='1';}bringToFront(w);}
function refreshTasks(){const t=document.getElementById('tasks');if(!t)return;t.innerHTML='';windows.forEach(w=>{if(w.style.display==='none'&&!minimized.has(w.id))return;const b=document.createElement('button');b.className='task';b.textContent=w.querySelector('.titlebar span')?.textContent||w.id;b.onclick=()=>{if(w.style.display==='none'){w.style.display='block';minimized.delete(w.id);}bringToFront(w);};if(parseInt(w.style.zIndex)===topZ&&w.style.display!=='none')b.classList.add('active');t.appendChild(b);});}

windows.forEach(w=>{const title=w.querySelector('.titlebar');title?.addEventListener('mousedown',e=>{if(e.target.classList.contains('wbtn'))return;bringToFront(w);if(w.dataset.maximized==='1')return;w.dataset.userMoved='1';const sx=e.clientX,sy=e.clientY,sl=w.offsetLeft,st=w.offsetTop;const move=ev=>{const d=document.getElementById('desktop'),maxL=Math.max(0,d.clientWidth-w.offsetWidth-2),maxT=Math.max(0,d.clientHeight-40-w.offsetHeight-2);w.style.left=Math.max(0,Math.min(maxL,sl+ev.clientX-sx))+'px';w.style.top=Math.max(0,Math.min(maxT,st+ev.clientY-sy))+'px';};const stop=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',stop);};document.addEventListener('mousemove',move);document.addEventListener('mouseup',stop);});w.addEventListener('mousedown',()=>bringToFront(w));});

function toggleStart(){if(!computerPoweredOn)return;document.getElementById('startMenu').classList.toggle('open');}
document.addEventListener('mousedown',e=>{if(!e.target.closest('#startMenu')&&!e.target.closest('.start'))document.getElementById('startMenu')?.classList.remove('open');});
function escapeHtml(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function searchWebsite(){const value=document.getElementById('url').value.trim();document.getElementById('browserPage').innerHTML=`<div class="unavailable"><h2>Website unavailable</h2><p>The website is down or unavailable.</p><p style="font-size:11px">${escapeHtml(value)}</p></div>`;}

/* =========================================================
   RETROOS FILE SYSTEM
========================================================= */
const FILE_KEY='retroos-files';
let retroFiles=[];
try{retroFiles=JSON.parse(localStorage.getItem(FILE_KEY)||'[]');}catch(e){retroFiles=[];}
if(!Array.isArray(retroFiles))retroFiles=[];
function saveFileStore(){localStorage.setItem(FILE_KEY,JSON.stringify(retroFiles));}
function safeFileName(name,ext){name=String(name||'').trim().replace(/[\\/:*?"<>|]/g,'');if(!name)name='Untitled';if(!name.toLowerCase().endsWith(ext))name+=ext;return name;}
function getFile(name){return retroFiles.find(f=>f.name.toLowerCase()===name.toLowerCase());}
function createOrSaveFile(name,content,type){const ext=type==='html'?'.html':'.txt';name=safeFileName(name,ext);let f=getFile(name);if(f){f.content=content;f.type=type;f.modified=Date.now();}else retroFiles.push({name,content,type,modified:Date.now()});saveFileStore();renderDocuments();return name;}

function newNotepadFile(){document.getElementById('notepadName').value='Untitled.txt';document.querySelector('#notepad .notepad').value='';document.getElementById('notepad').dataset.currentFile='';document.querySelector('#notepad .titlebar span').textContent='Notepad - Untitled.txt';document.querySelector('#notepad .notepad').focus();}
function saveNotepadFile(){const name=createOrSaveFile(document.getElementById('notepadName').value,document.querySelector('#notepad .notepad').value,'text');document.getElementById('notepadName').value=name;document.getElementById('notepad').dataset.currentFile=name;document.querySelector('#notepad .titlebar span').textContent='Notepad - '+name;}
function newIDEFile(){document.getElementById('ideName').value='Untitled.html';document.getElementById('codeEditor').value='<!DOCTYPE html>\n<html>\n<body>\n\n<h1>Hello RetroOS!</h1>\n\n</body>\n</html>';document.getElementById('ide').dataset.currentFile='';document.querySelector('#ide .titlebar span').textContent='RetroIDE - Untitled.html';document.getElementById('codeEditor').focus();}
function saveIDE(){const name=createOrSaveFile(document.getElementById('ideName').value,document.getElementById('codeEditor').value,'html');document.getElementById('ideName').value=name;document.getElementById('ide').dataset.currentFile=name;document.querySelector('#ide .titlebar span').textContent='RetroIDE - '+name;localStorage.setItem('retroos-ide',document.getElementById('codeEditor').value);}
function runIDE(){const code=document.getElementById('codeEditor').value;const url=URL.createObjectURL(new Blob([code],{type:'text/html'}));window.open(url,'_blank');}
function openRetroFile(name){const f=getFile(name);if(!f)return;if(f.type==='html'||name.toLowerCase().endsWith('.html')){openWindow('ide');document.getElementById('ideName').value=f.name;document.getElementById('codeEditor').value=f.content;document.getElementById('ide').dataset.currentFile=f.name;document.querySelector('#ide .titlebar span').textContent='RetroIDE - '+f.name;}else{openWindow('notepad');document.getElementById('notepadName').value=f.name;document.querySelector('#notepad .notepad').value=f.content;document.getElementById('notepad').dataset.currentFile=f.name;document.querySelector('#notepad .titlebar span').textContent='Notepad - '+f.name;}}
function renderDocuments(){const list=document.getElementById('documentsList');if(!list)return;list.innerHTML='';if(!retroFiles.length){list.innerHTML='<div class="empty-documents">My Documents is empty.</div>';return;}retroFiles.forEach(f=>{const row=document.createElement('div');row.className='retro-file';row.innerHTML=`<span>${f.type==='html'?'💻':'📄'}</span> <span>${escapeHtml(f.name)}</span>`;row.ondblclick=()=>openRetroFile(f.name);list.appendChild(row);});}
function openDocuments(){openWindow('files');document.getElementById('computerRoot').style.display='none';document.getElementById('documentsView').style.display='block';renderDocuments();}
function backToComputer(){document.getElementById('documentsView').style.display='none';document.getElementById('computerRoot').style.display='block';}

function setupFileSystemUI(){
    const note=document.querySelector('#notepad .content');
    if(note&&!document.getElementById('notepadName')){const bar=document.createElement('div');bar.className='file-toolbar';bar.innerHTML='<input id="notepadName" value="Untitled.txt"><button onclick="newNotepadFile()">New</button><button onclick="saveNotepadFile()">Save to My Documents</button>';note.insertBefore(bar,note.querySelector('.notepad'));}
    const ide=document.querySelector('#ide .ide-top');
    if(ide&&!ide.querySelector('.new-file-button')){const b=document.createElement('button');b.className='new-file-button';b.textContent='New';b.onclick=newIDEFile;ide.insertBefore(b,ide.firstChild);const save=ide.querySelector('button[onclick="saveIDE()"]');if(save)save.textContent='Save to My Documents';}
    const files=document.querySelector('#files .content');
    if(files&&!document.getElementById('documentsView')){const root=document.createElement('div');root.id='computerRoot';root.innerHTML=files.innerHTML;files.innerHTML='';files.appendChild(root);root.querySelectorAll('div').forEach(el=>{if(el.textContent.includes('📁 My Documents')){el.style.cursor='pointer';el.ondblclick=openDocuments;}});const docs=document.createElement('div');docs.id='documentsView';docs.style.display='none';docs.innerHTML='<div class="documents-header"><button onclick="backToComputer()">← Back</button> <strong>📁 My Documents</strong></div><div id="documentsList"></div>';files.appendChild(docs);}
    renderDocuments();
}

function updateClock(){document.getElementById('clock').textContent=new Date().toLocaleTimeString();}setInterval(updateClock,1000);updateClock();

function bootComputer(){const boot=document.getElementById('bootScreen'),text=document.getElementById('bootText');computerPoweredOn=false;windows.forEach(w=>w.style.display='none');boot.classList.remove('hidden','powered-off','crt-off');boot.classList.add('crt-on');boot.style.transform='';boot.style.color='#00ff66';text.innerHTML='';const lines=['RETROOS BIOS v1.98','','Memory Test ............ OK','Checking Keyboard ...... OK','Detecting Hard Drive ... OK','Checking System ........ OK','','Loading RETROOS ........ OK','','Starting system...'];lines.forEach((line,i)=>setTimeout(()=>{const d=document.createElement('div');d.className='boot-line';d.textContent=line;text.appendChild(d);},450+i*220));setTimeout(()=>boot.classList.add('crt-flicker'),2800);setTimeout(()=>{setupFileSystemUI();windows.forEach(w=>{w.style.display='block';w.style.zIndex='10';});arrangeWindows();topZ=20;refreshTasks();bringToFront(document.getElementById('browser'));computerPoweredOn=true;boot.classList.add('hidden');boot.classList.remove('crt-on','crt-flicker');},3200);}
function powerOff(){if(!computerPoweredOn)return;const boot=document.getElementById('bootScreen'),text=document.getElementById('bootText');computerPoweredOn=false;document.getElementById('startMenu').classList.remove('open');boot.classList.remove('hidden','powered-off','crt-on');boot.style.transform='scaleY(1)';boot.style.color='#00ff66';text.innerHTML='<div class="boot-line">Shutting down RETROOS...</div><div class="boot-line">Saving system settings... OK</div><div class="boot-line">Closing applications... OK</div><div class="boot-line">Powering off...</div>';windows.forEach(w=>w.style.display='none');void boot.offsetWidth;boot.classList.add('crt-off');setTimeout(()=>{boot.classList.remove('crt-off');boot.classList.add('powered-off');boot.style.transform='scaleY(1)';text.innerHTML='<div class="off-power">⏻</div>';},900);}
document.getElementById('bootScreen').addEventListener('click',function(){if(!computerPoweredOn&&this.classList.contains('powered-off')){this.classList.remove('powered-off');bootComputer();}});
window.addEventListener('resize',()=>{if(computerPoweredOn)arrangeWindows();});
windows.forEach(w=>w.style.display='none');setupFileSystemUI();
const oldCode=localStorage.getItem('retroos-ide');if(oldCode)document.getElementById('codeEditor').value=oldCode;
bootComputer();
