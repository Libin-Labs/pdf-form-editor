import { createPdfFormEditor } from '@lp-labs/pdf-form-editor';

const form = createPdfFormEditor([{ name: 'memo', type: 'text', multiline: true }]);
form.set('memo', 'A\nB');
const snapshot: Readonly<Record<string, string | boolean>> = form.valuesSnapshot();
void snapshot;
