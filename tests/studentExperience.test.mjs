import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
test('student progress persists under the same profile-specific key used for loading',()=>{
 assert.match(source,/localStorage\.getItem\(studentKey\(\)\)/);
 assert.match(source,/localStorage\.setItem\(studentKey\(\),JSON\.stringify\(store\)\)/);
});
test('grading checks required chapter concept and explains mismatch',()=>{
 assert.match(source,/const conceptRule=requires\[chapter\(\)\.title\]/);
 assert.match(source,/required Python concept is missing/);
 assert.match(source,/Expected:.*received:/);
});
