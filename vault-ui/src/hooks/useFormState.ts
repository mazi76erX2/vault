/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import validate from "validate.js";
import {
  ValidateJSSchema,
  ValidateFunctionValidator,
} from "../typings/validatejs";

export interface FormStateValues<T> {
  isValid: boolean;
  values: T;
  touched: { [Property in keyof T]: boolean };
  errors: { [Property in keyof T]: string[] };
  isLoading?: boolean;
}

interface Schema extends ValidateJSSchema {
  [key: string]: unknown;
}

interface FormStateProps<T> {
  schema?: {
    [Property in keyof T]?: Schema | ValidateFunctionValidator<T>;
  };
  initialState?: {
    isLoading?: boolean;
    isValid?: boolean;
    values: T;
    touched?: { [Property in keyof T]: boolean };
    errors?: { [Property in keyof T]: string[] };
  };
}

export interface FormState<T> {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleValueChange: (name: keyof T, value: unknown) => void;
  hasError: (field: keyof T) => boolean;
  handleClear: () => void;
  formState: FormStateValues<T>;
  setFormState: React.Dispatch<React.SetStateAction<FormStateValues<T>>>;
}

export const useFormState = <T extends NonNullable<unknown>>({
  schema,
  ...props
}: FormStateProps<T>): FormState<T> => {
  const [formState, setFormState] = useState<FormStateValues<T>>({
    isLoading: false,
    isValid: false,
    values: { ...props?.initialState?.values } as unknown as T,
    touched: { ...props?.initialState?.touched } as {
      [Property in keyof T]: boolean;
    },
    errors: { ...props?.initialState?.errors } as {
      [Property in keyof T]: string[];
    },
  });

  const values = React.useMemo(() => formState.values, [formState.values]);

  const handleErrorUpdates = () => {
    if (!schema) return;

    const errors = validate(formState.values, schema) as {
      [Property in keyof T]: string[];
    };

    setFormState((currentFormState) => ({
      ...currentFormState,
      isValid: !errors,
      errors: errors || ({} as { [Property in keyof T]: string[] }),
    }));
  };

  const handleClear = () => {
    setFormState({
      ...formState,
      values: props?.initialState?.values as T,
    });
  };

  const handleValueChange = (name: keyof T, value: unknown) => {
    setFormState((currentFormState) => ({
      ...currentFormState,
      values: {
        ...currentFormState.values,
        [name]: value,
      } as T,
      touched: {
        ...currentFormState.touched,
        [name]: true,
      },
    }));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const id = event?.currentTarget?.id;

    setFormState((formState) => ({
      ...formState,
      values: {
        ...formState.values,
        [id]: event?.currentTarget?.value,
      },
      touched: {
        ...formState.touched,
        [id]: true,
      },
    }));
  };

  const hasError = (field: keyof T) =>
    !!(formState.touched?.[field] && formState.errors?.[field]);

  React.useEffect(() => {
    handleErrorUpdates();
  }, [values]);

  return {
    handleChange,
    handleValueChange,
    hasError,
    handleClear,
    formState: {
      ...formState,
      values: {
        ...formState.values,
      } as T,
    },
    setFormState,
  };
};
