export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox-group"
  | "checkbox"
  | "date"
  | "time"
  | "file"
  | "image"
  | "video"
  | "heading"
  | "divider";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldCondition {
  fieldKey: string;
  operator: "equals" | "not_equals" | "contains" | "is_not_empty";
  value: string;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  allowedMimeTypes?: string[];
  maxFileSizeMb?: number;
}

export interface FormFieldDefinition {
  id: string;
  fieldKey: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  order: number;
  isSystem?: boolean; // System mandatory fields (fullName, email, phone) cannot be deleted
  defaultValue?: string | number | boolean | string[];
  options?: FieldOption[];
  validation?: FieldValidation;
  condition?: FieldCondition;
}

export interface FormAppearanceConfig {
  formTitle?: string;
  mainHeading?: string;
  shortDescription?: string;
  welcomeMessage?: string;
  instructionsBefore?: string;
  logoUrl?: string;
  headerImageUrl?: string;
  introImageUrl?: string;
  textBeforeFirstStep?: string;
  footerInformation?: string;
  submitButtonText?: string;
  successMessage?: string;
}

export interface FormStepDefinition {
  id: string;
  title: string;
  description?: string;
  order: number;
  isPaymentStep?: boolean;
  fields: FormFieldDefinition[];
}

export interface FormSchemaDefinition {
  steps: FormStepDefinition[];
  appearance?: FormAppearanceConfig;
}
