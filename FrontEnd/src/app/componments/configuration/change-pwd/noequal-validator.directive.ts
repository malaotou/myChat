import { Directive, forwardRef, Attribute } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
@Directive({
    selector: '[validateNoEqual]',
    providers: [{provide: NG_VALIDATORS, useExisting: NoEqualValidator, multi: true}]
  })
  export class NoEqualValidator implements Validator {
    validate(c: AbstractControl): { [key: string]: any; } {
        let value: string = c.value || '';
        if (!value.startsWith('159')) {
            return {
                mobile: {
                    msg: '手机号必须是159开头',
                    actualValue: value
                }
            };
        }
        return null;
    }
  }