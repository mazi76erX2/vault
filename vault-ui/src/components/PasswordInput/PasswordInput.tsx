import * as React from "react";
import { HCTextFieldProps, HCPasswordField } from "generic-components";

export function PasswordInput(props: HCTextFieldProps) {
  return <HCPasswordField {...props} />;
}
