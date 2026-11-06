export type PdfFormField =
  | {
      readonly name: string;
      readonly type: 'text';
      readonly required?: boolean;
      readonly multiline?: boolean;
      readonly maxLength?: number;
    }
  | {
      readonly name: string;
      readonly type: 'checkbox';
      readonly required?: boolean;
    }
  | {
      readonly name: string;
      readonly type: 'choice';
      readonly required?: boolean;
      readonly options: readonly string[];
    };

export type PdfFormValue = string | boolean;
export interface FormValidationIssue {
  readonly name: string;
  readonly code: 'required' | 'type' | 'length' | 'choice' | 'multiline';
  readonly message: string;
}

export class PdfFormEditorError extends Error {
  constructor(
    readonly code: 'invalid' | 'duplicate' | 'not-found' | 'limit',
    message: string,
  ) {
    super(message);
    this.name = 'PdfFormEditorError';
  }
}

export class PdfFormEditor {
  private readonly fields = new Map<string, PdfFormField>();
  private readonly values = new Map<string, PdfFormValue>();

  constructor(
    fields: readonly PdfFormField[],
    readonly maxFields = 5000,
  ) {
    if (fields.length > maxFields)
      throw new PdfFormEditorError('limit', 'Form field limit exceeded.');
    for (const field of fields) {
      this.validateField(field);
      if (this.fields.has(field.name))
        throw new PdfFormEditorError('duplicate', `Field ${field.name} appears twice.`);
      this.fields.set(field.name, {
        ...field,
        ...(field.type === 'choice' ? { options: [...field.options] } : {}),
      } as PdfFormField);
    }
  }

  set(name: string, value: PdfFormValue): void {
    const field = this.fields.get(name);
    if (!field) throw new PdfFormEditorError('not-found', `Field ${name} was not found.`);
    if (field.type === 'checkbox' ? typeof value !== 'boolean' : typeof value !== 'string') {
      throw new PdfFormEditorError(
        'invalid',
        `Value type does not match ${field.type} field ${name}.`,
      );
    }
    this.values.set(name, value);
  }

  get(name: string): PdfFormValue | undefined {
    return this.values.get(name);
  }

  valuesSnapshot(): Readonly<Record<string, PdfFormValue>> {
    return Object.freeze(Object.fromEntries(this.values));
  }

  validate(): readonly FormValidationIssue[] {
    const issues: FormValidationIssue[] = [];
    for (const [name, field] of this.fields) {
      const value = this.values.get(name);
      if (value === undefined || value === '' || value === false) {
        if (field.required)
          issues.push({
            name,
            code: 'required',
            message: 'A required value is missing.',
          });
        continue;
      }
      if (field.type === 'text' && typeof value === 'string') {
        if (!field.multiline && /[\r\n]/.test(value))
          issues.push({
            name,
            code: 'multiline',
            message: 'Line breaks are not allowed.',
          });
        if (value.length > (field.maxLength ?? 10_000))
          issues.push({
            name,
            code: 'length',
            message: 'Text exceeds the field limit.',
          });
      } else if (
        field.type === 'choice' &&
        typeof value === 'string' &&
        !field.options.includes(value)
      ) {
        issues.push({
          name,
          code: 'choice',
          message: 'Value is not one of the declared options.',
        });
      }
    }
    return issues;
  }

  private validateField(field: PdfFormField): void {
    if (!field.name || field.name.length > 200)
      throw new PdfFormEditorError('invalid', 'Field names must contain 1–200 characters.');
    if (
      field.type === 'text' &&
      field.maxLength !== undefined &&
      (!Number.isSafeInteger(field.maxLength) || field.maxLength < 0)
    ) {
      throw new PdfFormEditorError('invalid', `Invalid text limit for ${field.name}.`);
    }
    if (
      field.type === 'choice' &&
      (!field.options.length ||
        new Set(field.options).size !== field.options.length ||
        field.options.some((option) => option.length > 500))
    ) {
      throw new PdfFormEditorError(
        'invalid',
        `Choice field ${field.name} needs unique bounded options.`,
      );
    }
  }
}

export function createPdfFormEditor(
  fields: readonly PdfFormField[],
  maxFields?: number,
): PdfFormEditor {
  return new PdfFormEditor(fields, maxFields);
}
