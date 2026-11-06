import test from 'node:test';
import assert from 'node:assert/strict';
import { createPdfFormEditor } from '../dist/esm/index.js';

const fields = [
  { name: 'name', type: 'text', required: true, maxLength: 20 },
  { name: 'notes', type: 'text', multiline: true },
  { name: 'accept', type: 'checkbox', required: true },
  { name: 'color', type: 'choice', options: ['red', 'blue'] },
];

test('validates typed text, multiline values, booleans, and choice membership', () => {
  const form = createPdfFormEditor(fields);
  form.set('name', 'Ada');
  form.set('notes', 'line one\nline two');
  form.set('accept', true);
  form.set('color', 'blue');
  assert.deepEqual(form.validate(), []);
  assert.equal(form.valuesSnapshot().name, 'Ada');
});

test('reports required values and rejects mismatched field types', () => {
  const form = createPdfFormEditor(fields);
  assert.deepEqual(
    form.validate().map((issue) => issue.name),
    ['name', 'accept'],
  );
  assert.throws(() => form.set('accept', 'yes'), { code: 'invalid' });
  assert.throws(() => form.set('absent', 'x'), { code: 'not-found' });
});

test('reports single-line and maximum-length violations', () => {
  const form = createPdfFormEditor(fields);
  form.set('name', 'a'.repeat(21));
  form.set('notes', 'one\ntwo');
  form.set('accept', true);
  assert.deepEqual(
    form.validate().map((issue) => issue.code),
    ['length'],
  );
  form.set('name', 'Ada\nLovelace');
  assert.ok(form.validate().some((issue) => issue.code === 'multiline'));
});

test('rejects duplicate names and malformed option sets', () => {
  assert.throws(
    () =>
      createPdfFormEditor([
        { name: 'x', type: 'checkbox' },
        { name: 'x', type: 'text' },
      ]),
    { code: 'duplicate' },
  );
  assert.throws(() => createPdfFormEditor([{ name: 'x', type: 'choice', options: ['a', 'a'] }]), {
    code: 'invalid',
  });
});
