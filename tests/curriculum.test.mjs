import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const chapters=JSON.parse(fs.readFileSync(new URL('../src/curriculum.json',import.meta.url),'utf8'));
const all=chapters.flatMap(c=>c.lessons);
test('15 chapters, unique lesson IDs, and substantial practice',()=>{
 assert.equal(chapters.length,15);
 assert.equal(new Set(all.map(l=>l.id)).size,all.length);
 assert.ok(all.length>=170);
});
test('each chapter teaches before assigning and includes workshop and review',()=>{
 for(const c of chapters){
  assert.equal(c.lessons[0].type,'reading',c.title);
  assert.ok(c.lessons.some(l=>l.id.endsWith('-guided')),c.title);
  assert.ok(c.lessons.some(l=>l.id.endsWith('-review')),c.title);
  assert.ok(c.lessons.filter(l=>l.type==='exercise').length>=5,c.title);
 }
});
test('lessons contain complete teaching and solution fields',()=>{
 for(const l of all){
  for(const k of ['title','intro','concept','example','instructions','starter','solution','expected','hint','qa'])
   assert.ok(typeof l[k]==='string'&&l[k].trim(),l.id+' missing '+k);
 }
});
test('every practice item has expected output',()=>{
 for(const l of all.filter(l=>['exercise','project'].includes(l.type)))assert.ok(l.expected.trim(),l.id);
});

test('theory introduces concepts once per chapter without exact duplicate sections',()=>{
 for(const c of chapters){
  const seen=new Set();
  for(const l of c.lessons.filter(l=>l.type==='reading')){
   assert.ok(Array.isArray(l.theorySections)&&l.theorySections.length>=1,l.id);
   for(const section of l.theorySections){
    const key=[section.heading,section.body||'',section.code||'',section.output||'',section.explanation||''].join('|').toLowerCase().replace(/\\s+/g,' ').trim();
    assert.ok(!seen.has(key),'Repeated theory section: '+l.id+' '+section.heading);
    seen.add(key);
   }
  }
 }
});
test('chapters retain core teaching, corrections, and QA applications',()=>{
 for(const c of chapters.slice(0,14)){
  const sections=c.lessons.filter(l=>l.type==='reading').flatMap(l=>l.theorySections);
  for(const heading of ['Core concept explained','Rules and important details','Common mistake and correction','How QA engineers use this']){
   assert.ok(sections.some(s=>s.heading===heading),c.title+' missing '+heading);
  }
  for(const heading of ['Core concept explained','Rules and important details','How QA engineers use this']){
   const section=sections.find(s=>s.heading===heading);
   assert.ok(section?.code&&section?.output!==undefined&&section?.explanation,c.title+' '+heading);
  }
 }
});

test('type conversion lesson teaches conversion rather than only inspecting types',()=>{
 const chapter=chapters.find(c=>c.title==='Python Data Types');
 const lesson=chapter.lessons.find(l=>l.id==='03-theory-3');
 const examples=lesson.theorySections.map(s=>s.code||'').join('\\n');
 assert.match(examples,/int\\(/);
 assert.match(examples,/float\\(/);
 assert.match(examples,/str\\(/);
 assert.match(examples,/ValueError|bool\\(/);
});
test('chapter intros do not repeat entire lessons',()=>{
 for(const c of chapters){
  const intro=c.lessons.find(l=>l.id.endsWith('-intro'));
  assert.ok(intro?.theorySections?.length<=2,c.title+' intro repeats the lesson content');
 }
});
