# @lp-labs/pdf-form-editor

A typed in-memory field/value model with required, choice, single-line, multiline, and length
validation. It does not serialize form values into a PDF.

## Install and quick start

```sh
npm install @lp-labs/pdf-form-editor
```

```js
import { createPdfFormEditor } from '@lp-labs/pdf-form-editor';

const form = createPdfFormEditor([
  { name: 'name', type: 'text', required: true, maxLength: 80 },
  { name: 'notes', type: 'text', multiline: true },
  { name: 'approved', type: 'checkbox' },
  { name: 'color', type: 'choice', options: ['blue', 'green'] },
]);
form.set('name', 'Ada');
form.set('approved', true);
console.log(form.validate());
```

## API, types, and customization

- `PdfFormField` is a discriminated union for `text` (optional `multiline`/`maxLength`),
  `checkbox`, and `choice` (unique declared options); `PdfFormValue` is `string | boolean`.
- `createPdfFormEditor(fields, maxFields?)` returns `PdfFormEditor`, with `set`, `get`,
  `valuesSnapshot`, and `validate`. `FormValidationIssue` identifies `required`, `type`, `length`,
  `choice`, and `multiline` conditions. The default field cap is 5,000; a text field defaults to
  10,000 UTF-16 code units.
- `PdfFormEditorError` codes: `invalid`, `duplicate`, `not-found`, and `limit`. Values are validated
  on `validate()` so adapters can collect invalid choice values before reporting all issues.

## Interoperability and scope

Map form names and field-specific values to your PDF form adapter. The editor does not model widgets,
field inheritance, appearance states, signatures, or PDF bytes. Definitions and snapshots stay in
memory; validation scans declared fields.

ESM, CommonJS, and TypeScript declarations are included. There are no runtime or peer dependencies;
TypeScript and Prettier are development-only.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
