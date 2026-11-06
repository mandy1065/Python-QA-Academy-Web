import curriculum from './curriculum.json';
import './style.css';

const STORAGE='python-qa-academy-v1';
const store=(()=>{try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{return {}}})();
store.completed ||= {};
store.code ||= {};
let chapterIndex=0,lessonIndex=0,worker=null,workerReady=false,workerTimer=null,requestId=0,queued=null;
const root=document.querySelector('#app');
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const chapter=()=>curriculum[chapterIndex],lesson=()=>chapter().lessons[lessonIndex];
const completed=()=>!!store.completed[lesson().id];
const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(store))}catch{}};
const totalLessons=curriculum.reduce((n,c)=>n+c.lessons.length,0);
const totalDone=()=>Object.values(store.completed).filter(Boolean).length;
function setLocation(c,l){chapterIndex=Math.max(0,Math.min(c,curriculum.length-1));lessonIndex=Math.max(0,Math.min(l,chapter().lessons.length-1));render();}
function next(){if(lessonIndex+1<chapter().lessons.length)setLocation(chapterIndex,lessonIndex+1);else if(chapterIndex+1<curriculum.length)setLocation(chapterIndex+1,0);}
function previous(){if(lessonIndex>0)setLocation(chapterIndex,lessonIndex-1);else if(chapterIndex>0)setLocation(chapterIndex-1,curriculum[chapterIndex-1].lessons.length-1);}
function mark(){store.completed[lesson().id]=true;save();render();}
function startWorker(){
 if(worker)worker.terminate(); workerReady=false;
 worker=new Worker(new URL('./worker.js',import.meta.url));
 worker.onmessage=event=>{
  const msg=event.data;
  if(msg.type==='ready'){workerReady=true;document.querySelector('#runtime-status')?.replaceChildren(document.createTextNode('Python ready'));return;}
  if(msg.type==='fatal'){workerReady=false;setConsole('Python could not load: '+msg.error,'error');return;}
  if(msg.type==='result'&&msg.id===requestId){clearTimeout(workerTimer);workerTimer=null;queued?.(msg);queued=null;}
 };
 worker.onerror=e=>{setConsole('Python runtime error: '+e.message,'error');};
}
function setConsole(text,kind='neutral'){const el=document.querySelector('#console-output');if(el){el.textContent=text;el.dataset.kind=kind;}}
function setFeedback(text,kind='neutral'){const el=document.querySelector('#feedback');if(el){el.textContent=text;el.dataset.kind=kind;}}
function run(check){
 const code=document.querySelector('#code-editor')?.value??'';
 store.code[lesson().id]=code;save();
 if(!workerReady){setFeedback('Python is still loading. Please wait a moment.','warning');return;}
 if(!code.trim()){setFeedback('Write some Python code before running.','warning');return;}
 const runBtn=document.querySelector('#run'),testBtn=document.querySelector('#test');
 runBtn.disabled=testBtn.disabled=true;
 setConsole('Running Python…');setFeedback('');
 const currentId=++requestId;
 queued=msg=>{
  runBtn.disabled=testBtn.disabled=false;
  if(msg.error){setConsole(msg.output+'\n'+msg.error,'error');setFeedback('Python raised an error. Read the console and try again.','error');return;}
  setConsole(msg.output||'(Your code ran but printed no output.)','success');
  if(!check){setFeedback('Code ran successfully. Select Run Tests to check the exercise.','success');return;}
  const actual=msg.output.replace(/\r\n/g,'\n').trim();
  const expected=lesson().expected.trim();
  if(actual===expected){store.completed[lesson().id]=true;save();setFeedback('✓ All output tests passed. Great work!','success');document.querySelector('#next').disabled=false;document.querySelector('#progress').textContent=totalDone()+' / '+totalLessons+' lessons';}
  else{setFeedback('Tests did not pass. Compare the expected output with your console result.','error');}
 };
 worker.postMessage({type:'run',id:currentId,code,expected:lesson().expected});
 workerTimer=setTimeout(()=>{
  workerTimer=null;queued=null;startWorker();
  setConsole('Execution stopped after 5 seconds. Check for an infinite loop or slow operation.','error');
  setFeedback('Time limit exceeded. Your code was stopped; the Python runtime is restarting.','error');
  document.querySelector('#run').disabled=false;document.querySelector('#test').disabled=false;
 },5000);
}
function download(){const blob=new Blob([JSON.stringify({chapter:chapter().title,lesson:lesson().title,code:document.querySelector('#code-editor')?.value,completed:completed(),date:new Date().toISOString()},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`python-qa-${lesson().id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function render(){
 const c=chapter(),l=lesson();const isReading=l.type==='reading';
 const code=store.code[l.id]??l.starter;
 const done=totalDone();
 root.innerHTML=`<header class="top"><a class="brand" href="/" aria-label="Python QA Academy home"><span class="logo">{ py }</span> Python <strong>QA Academy</strong></a><div class="top-center">Learn Python by building real QA skills</div><div class="top-right"><span class="runtime" id="runtime-status">${workerReady?'Python ready':'Loading Python…'}</span><span class="progress-count" id="progress">${done} / ${totalLessons} lessons</span></div></header>
 <div class="shell"><aside class="sidebar"><div class="sidebar-head"><div class="eyebrow">YOUR LEARNING PATH</div><h2>Python for QA</h2><p>12 chapters · ${totalLessons} lessons</p><div class="progress-track"><div style="width:${Math.round(done/totalLessons*100)}%"></div></div></div><nav aria-label="Chapters">${curriculum.map((item,i)=>`<div class="chapter"><button class="chapter-btn ${i===chapterIndex?'active':''}" data-chapter="${i}"><span class="chapter-num">${String(i+1).padStart(2,'0')}</span><span class="chapter-name">${escapeHTML(item.title)}</span><span class="chapter-check">${item.lessons.every(x=>store.completed[x.id])?'✓':'⌄'}</span></button>${i===chapterIndex?`<div class="lesson-links">${item.lessons.map((entry,j)=>`<button data-lesson="${j}" class="lesson-link ${j===lessonIndex?'selected':''}"><span>${store.completed[entry.id]?'✓':j+1}</span>${escapeHTML(entry.title)}</button>`).join('')}</div>`:''}</div>`).join('')}</nav><div class="sidebar-foot">Progress is saved in this browser. No account required.</div></aside>
 <main class="main"><div class="lesson-top"><div><div class="breadcrumb">CHAPTER ${c.id} <span> / </span> LESSON ${lessonIndex+1} OF ${c.lessons.length}</div><h1>${escapeHTML(l.title)}</h1><p>${escapeHTML(c.summary)}</p></div><span class="kind">${l.type==='project'?'Final project':isReading?'Concept lesson':'Coding exercise'}</span></div>
 <div class="workspace"><section class="instructions"><div class="panel-header"><span>📖 Instructions</span><span class="step-tag">Step ${lessonIndex+1}</span></div><div class="instruction-scroll"><div class="concept-label">LEARN THE CONCEPT</div><h2>${escapeHTML(l.title)}</h2><p>${escapeHTML(l.intro)}</p><p>${escapeHTML(l.concept)}</p><div class="example-label">WORKED PYTHON EXAMPLE</div><pre class="example"><code>${escapeHTML(l.example)}</code></pre><p class="explain">${escapeHTML(l.qa)}</p><div class="task"><div class="task-title">🎯 Your task</div><p>${escapeHTML(l.instructions)}</p></div>${!isReading?`<div class="expected"><strong>Expected output</strong><pre>${escapeHTML(l.expected)}</pre></div>`:''}<details><summary>💡 Show hint</summary><p>${escapeHTML(l.hint)}</p></details><details><summary>📋 Show full copyable solution</summary><p>Use this after trying on your own. You can copy it into the editor.</p><pre class="solution">${escapeHTML(l.solution)}</pre><button class="small" id="copy-solution">Copy solution into editor</button></details><div class="lesson-tip">💡 <strong>Beginner tip:</strong> Try to explain each line before moving on. Learning the reasoning is more important than memorizing the answer.</div></div></section>
 <section class="editor-panel"><div class="panel-header"><span>⌨ main.py</span><div><button class="small ghost" id="reset">↺ Reset</button><button class="small ghost" id="download">↓ Save</button></div></div><div class="editor-wrap"><div class="line-gutter" id="line-gutter">1</div><textarea spellcheck="false" aria-label="Python code editor" id="code-editor">${escapeHTML(code)}</textarea></div><div class="actions"><button id="run" class="secondary">▶ Run Code</button><button id="test" class="primary">✓ Run Tests</button>${isReading?'<button id="mark-read" class="secondary">Mark as read</button>':''}</div><div class="console-head"><span>▣ Console</span><span>Python output</span></div><pre id="console-output" class="console">Your output will appear here. Run your Python code to begin.</pre><div id="feedback" class="feedback" role="status"></div></section></div>
 <div class="bottom-nav"><button id="previous" ${chapterIndex===0&&lessonIndex===0?'disabled':''}>← Previous lesson</button><span>${completed()?'✓ Completed':'Complete this lesson to continue'}</span><button id="next" ${!completed()?'disabled':''}>Next lesson →</button></div><footer>Original Python QA learning curriculum · Built for beginner QA engineers · No affiliation with freeCodeCamp</footer></main></div>`;
 root.querySelectorAll('[data-chapter]').forEach(btn=>btn.addEventListener('click',()=>setLocation(Number(btn.dataset.chapter),0)));
 root.querySelectorAll('[data-lesson]').forEach(btn=>btn.addEventListener('click',()=>setLocation(chapterIndex,Number(btn.dataset.lesson))));
 root.querySelector('#run').addEventListener('click',()=>run(false));root.querySelector('#test').addEventListener('click',()=>run(true));
 root.querySelector('#previous').addEventListener('click',previous);root.querySelector('#next').addEventListener('click',next);
 root.querySelector('#reset').addEventListener('click',()=>{const editor=root.querySelector('#code-editor');editor.value=l.starter;store.code[l.id]=l.starter;save();updateGutter();});
 root.querySelector('#download').addEventListener('click',download);
 root.querySelector('#copy-solution').addEventListener('click',()=>{const editor=root.querySelector('#code-editor');editor.value=l.solution;store.code[l.id]=l.solution;save();updateGutter();editor.focus();});
 root.querySelector('#mark-read')?.addEventListener('click',mark);
 const editor=root.querySelector('#code-editor');editor.addEventListener('input',()=>{store.code[l.id]=editor.value;save();updateGutter();});
 editor.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const start=editor.selectionStart,end=editor.selectionEnd;editor.setRangeText('    ',start,end,'end');editor.dispatchEvent(new Event('input'));}});
 function updateGutter(){root.querySelector('#line-gutter').textContent=Array.from({length:Math.max(1,editor.value.split('\n').length)},(_,i)=>i+1).join('\n');}
 updateGutter();editor.addEventListener('scroll',()=>{root.querySelector('#line-gutter').scrollTop=editor.scrollTop;});
}
render();startWorker();
