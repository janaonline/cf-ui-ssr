interface Validator {
  name: string;
  validator: any;
  message: string;
}

export interface FieldConfig {
  required?: any;
  label: string;
  key: string;
  formFieldType: string;
  data?: any[];
  value?: any;
  validations?: Validator[];
  showAsterisk: boolean;
  options?: any[];
  optionName?: string;
  readonly: boolean;
}
