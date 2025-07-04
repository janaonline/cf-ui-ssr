import { AbstractControl, FormArray } from '@angular/forms';

export function compareFieldsValidator(
  controlName: string,
  matchingControlName: string,
  type: string,
) {
  return (group: AbstractControl) => {
    const control = group.get(controlName)?.get('value');

    const matchingControl = group.get(matchingControlName)?.get('value');

    if (!control || !matchingControl) {
      return null;
    }

    // return if another validator has already found an error on the matchingControl
    // if (matchingControl.errors && !matchingControl.errors['lessThan']) {
    if (control.errors && !control.errors[type]) {
      return null;
    }

    // set error on matchingControl if validation fails
    // console.log('control.value', control.value, 'matchingControl.value', matchingControl.value);

    // 2024 > 2011
    if (type === 'greaterThanEqualTo' && control.value < matchingControl.value) {
      // matchingControl.setErrors({ lessThan: true });
      control.setErrors({ [type]: true });
    } else if (type === 'lessThan' && control.value > matchingControl.value) {
      // matchingControl.setErrors({ lessThan: true });
      control.setErrors({ [type]: true });
    } else {
      control.setErrors(null);
    }
    return null;
  };
}

export function compareArrFieldsValidator(
  controlName: string,
  matchingControlName: string,
  type: string,
) {
  return (group: AbstractControl) => {
    const rawValue = group.getRawValue();
    const controlIndex = rawValue.findIndex((e: any) => e[controlName]);
    const matchIndex = rawValue.findIndex((e: any) => e[matchingControlName]);

    // console.log('group', controlName, '----', (group as FormArray).controls[controlIndex]?.get(controlName))
    // console.log('group', controlName, '----', (group as FormArray).controls[controlIndex])

    // console.log('controlIndex',controlIndex,'matchIndex',matchIndex);

    // const control = group.get(controlName)?.get('value');
    // const matchingControl = group.get(matchingControlName)?.get('value');

    const control = (group as FormArray).controls[controlIndex]?.get(controlName);
    const matchingControl = (group as FormArray).controls[matchIndex]?.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    // return if another validator has already found an error on the matchingControl
    // if (matchingControl.errors && !matchingControl.errors['lessThan']) {
    if (control.errors && !control.errors[type]) {
      return null;
    }

    // set error on matchingControl if validation fails
    const controlVal = Number(control.value);
    const matchVal = Number(matchingControl.value);
    // 2024 > 2011
    if (type === 'greaterThanEqualTo' && controlVal < matchVal) {
      control.setErrors({ [type]: true });
    } else if (type === 'lessThan' && controlVal > matchVal) {
      control.setErrors({ [type]: true });
    } else {
      control.setErrors(null);
    }
    return null;
  };
}
