import {
  createPdfFormEditor,
  type FormValidationIssue,
  type PdfFormField,
  type PdfFormValue,
} from '@lp-labs/pdf-form-editor';

const fields: readonly PdfFormField[] = [{ name: 'consent', type: 'checkbox', required: true }];
const form = createPdfFormEditor(fields);
const value: PdfFormValue | undefined = form.get('consent');
const issues: readonly FormValidationIssue[] = form.validate();
void value;
void issues;
