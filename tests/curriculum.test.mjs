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

test('detailed theory covers rules, examples, mistakes, and QA applications',()=>{
 for(const c of chapters.slice(0,14)){
  const theory=c.lessons.filter(l=>l.type==='reading');
  for(const l of theory){
   assert.ok(Array.isArray(l.theorySections)&&l.theorySections.length>=8,l.id);
   assert.ok(l.theorySections.some(s=>s.heading==='Common mistake and correction'),l.id);
   assert.ok(l.theorySections.some(s=>s.heading==='How QA engineers use this'),l.id);
  }
 }
});
