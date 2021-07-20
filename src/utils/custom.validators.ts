import { FormControl, ValidatorFn, ValidationErrors, Validators } from "@angular/forms";
import { constants } from '../constants/constants'

export class CustomValidators {

  public static requiredIfBoxChecked(siblingName?: string, errorMessage?: string): ValidatorFn {
    return (control: FormControl): ValidationErrors => {
      if (control.parent) {
        const boxValue = +control.parent.controls[siblingName].value;
      if(boxValue) {
        control.setValidators(Validators.required);
        return { maxValue: boxValue, label: errorMessage || '' }
      } else {
        // control.setValidators([]);
        return null;
      }    
    
    }
  }
  }

  public static maxValue(maxValue: number, errorMessage?: string): ValidatorFn {
    return (control: FormControl): ValidationErrors => {
      const value = +control.value;
      if (value && !isNaN(value)) {
        if (value > maxValue)
          return { maxValue: maxValue, label: errorMessage || '' }
      }
      return null;
    }
  }
  public static minValue(minValue: number, errorMessage?: string): ValidatorFn {
    return (control: FormControl): ValidationErrors => {
      const value = +control.value;
      if (!isNaN(value)) {
        if (value < minValue)
          return { minValue: minValue, label: errorMessage || '' }
      }
      return null;
    }
  }
  public static lessThan(siblingName?: string, errorMessage?: string): ValidatorFn {
    return (control: FormControl): ValidationErrors => {
      if (control.parent) {
        const startRad = +control.value;
        const maxRad = +control.parent.controls[siblingName].value;
        if (startRad && !isNaN(startRad) || maxRad && !isNaN(maxRad)) {
          if (maxRad < startRad)
            return { lessThan: maxRad, label: errorMessage || '' }
          else {
            if (!(control.parent.controls[siblingName] as FormControl).valid)
              (control.parent.controls[siblingName] as FormControl).updateValueAndValidity({ onlySelf: true });
          }
        }
        return null;
      }
    }
  }
  public static greaterThan(siblingName?: string, errorMessage?: string): ValidatorFn {
    return (control: FormControl): ValidationErrors => {
      if (control.parent) {
        const maxRad = +control.value;
        const startRad = +control.parent.controls[siblingName].value;
        if (startRad && !isNaN(startRad) || maxRad && !isNaN(maxRad)) {
          if (maxRad < startRad)
            return { greaterThan: startRad, label: errorMessage || '' }
          else {
            if (!(control.parent.controls[siblingName] as FormControl).valid)
              (control.parent.controls[siblingName] as FormControl).updateValueAndValidity({ onlySelf: true });
          }
        }
        return null;
      }
    }
  }
  public static validateEmail(errorMessage?: string): ValidatorFn {
    return (control: FormControl): ValidationErrors => {
      const value = control.value;
      if (!constants.emailPattern.test(value)) {
        return { validateEmail: value, label: errorMessage || '' }
      }
      return null;
    }
  }


  public static updateSiblingValidators(onParentValue: any, siblingName: string, validators: ValidatorFn | ValidatorFn[]): ValidatorFn {
    return (control: FormControl): ValidationErrors => {
      if (control && control.parent) {
        const value = control.value;
        const fc = control.parent.controls[siblingName] as FormControl;
        if (value == onParentValue) {
          fc.clearValidators();
          fc.setValidators(validators);
        }
        else {
          fc.clearValidators();
        }
        fc.updateValueAndValidity();
      }
      return null;
    }
  }
  public static confirmPassword(errorMessage: string, siblingName: string): ValidatorFn {
    return (control: FormControl): ValidationErrors => {
      if (control && control.parent) {
        const value = control.value;
        if (control.parent.controls[siblingName].value != value) {
          return { confirmPassword: true, label: errorMessage || '' }
        }
      }
      return null;
    }
  }

  // export const atLeastOne = (validator: ValidatorFn) => (
//   group: FormGroup,
// ): ValidationErrors | null => {
//   const hasAtLeastOne = group && group.controls && Object.keys(group.controls)
//       .some(k => !validator(group.controls[k]));

//   return hasAtLeastOne ? null : {
//       atLeastOne: true,
//   };
// };

}

