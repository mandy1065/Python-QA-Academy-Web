import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const chapters=JSON.parse(fs.readFileSync(new URL('../src/curriculum.json',import.meta.url),'utf8'));
test('12 chapters and 108 unique lessons',()=>{assert.equal(chapters.length,12);const all=chapters.flatMap(c=>c.lessons);assert.equal(all.length,108);assert.equal(new Set(all.map(l=>l.id)).size,108);});
test('all lessons have complete instructional content',()=>{for(const c of chapters){assert.equal(c.lessons.length,9);for(const l of c.lessons){for(const key of ['title','intro','concept','example','instructions','starter','solution','expected','hint','qa'])assert.ok(typeof l[key]==='string'&&l[key].trim(),`${l.id} missing ${key}`);}}});
test('all 72 exercises and 12 projects have nonempty expected outputs',()=>{
 const items=chapters.flatMap(c=>c.lessons.filter(l=>l.type==='exercise'||l.type==='project'));
 assert.equal(items.length,84);
 for(const l of items){assert.ok(l.solution.trim());assert.ok(l.expected.trim());}
});
