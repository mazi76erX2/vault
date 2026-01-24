/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { z } from "zod";

export interface FormStateValues<T> {
  isValid: boolean;
  values: T;
  touched: { [Property in keyof T]?: boolean };
  errors: { [Property in keyof T]?: string[] };
  isLoading?: boolean;
}

interface FormStateProps<T> {
  schema?: z.ZodSchema<any>;
  initialState?: {
    isLoading?: boolean;
    isValid?: boolean;
    values: T;
    touched?: { [Property in keyof T]?: boolean };
    errors?: { [Property in keyof T]?: string[] };
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

export const useFormState = <T extends Record<string, any>>({
  schema,
  ...props
}: FormStateProps<T>): FormState<T> => {
  const [formState, setFormState] = useState<FormStateValues<T>>({
    isLoading: false,
    isValid: false,
    values: { ...props?.initialState?.values } as T,
    touched: { ...props?.initialState?.touched } || {},
    errors: { ...props?.initialState?.errors } || {},
  });

  const values = React.useMemo(() => formState.values, [formState.values]);

  const handleErrorUpdates = () => {
    if (!schema) return;

    const result = schema.safeParse(formState.values);

    const errors: Record<string, string[]> = {};
    if (!result.success) {
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
    }

    setFormState((currentFormState) => ({
      ...currentFormState,
      isValid: result.success,
      errors: errors as { [Property in keyof T]?: string[] },
    }));
  };

  const handleClear = () => {
    setFormState({
      ...formState,
      values: props?.initialState?.values as T,
      touched: {},
      errors: {},
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
    formState,
    setFormState,
  };
};
