import {ErrorCode} from '../../common/error_codes';
import {formatErrorCode} from '../i18n/config';

export interface BasicFormField<T> {
    label?: string;
    value: T;
    errors: ErrorCode[];
}

export type ValidateFunc<T> = (value: T) => ErrorCode[]|undefined;

// Return true if the field has error.
export function validateBasicFormField<T>(field: BasicFormField<T>, validator: ValidateFunc<T>): boolean {
    field.errors = validator(field.value) || [];
    return field.errors.length > 0;
}

export function formatSingleFieldErrors(errors: ErrorCode[]): string {
    return errors.map((error) => formatErrorCode(error)).join(';');
}
