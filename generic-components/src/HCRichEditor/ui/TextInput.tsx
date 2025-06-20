/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as React from 'react';
import {HTMLInputTypeAttribute} from 'react';
import {styled} from '@mui/material';

const InputWrapperDiv = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
  
  .Input__label {
    display: flex;
    flex: 1;
    color: #666;
  }
  .Input__input {
    display: flex;
    flex: 2;
    border: 1px solid #999;
    padding-top: 7px;
    padding-bottom: 7px;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 16px;
    border-radius: 5px;
    min-width: 0;
  }
`;

type Props = Readonly<{
    label: string;
    onChange: (val: string) => void;
    placeholder?: string;
    value: string;
    type?: HTMLInputTypeAttribute;
}>;

export default function TextInput({
    label,
    value,
    onChange,
    placeholder = '',
    type = 'text',
}: Props): JSX.Element {
    return (
        <InputWrapperDiv className="Input__wrapper">
            <label className="Input__label">{label}</label>
            <input
                type={type}
                className="Input__input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
            />
        </InputWrapperDiv>
    );
}
