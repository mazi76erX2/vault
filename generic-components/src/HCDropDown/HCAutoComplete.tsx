import * as React from 'react';
import {HCDropDownProps, HCDropDownValue} from './HCDropDown';
import {Autocomplete, Divider, MenuItem, useTheme, Box, CircularProgress} from '@mui/material';
import {HCFormControl} from '../HCFormCommon';
import {HCTextField} from '../HCTextField';
import {Theme} from '../theme';
import {KeyboardArrowDown, KeyboardArrowUp} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export interface HCAutoCompleteOptionValue extends HCDropDownValue {
    new?: boolean;
}

export interface HCAutoCompleteProps extends Omit<HCDropDownProps, 'onChange'> {
    options: HCAutoCompleteOptionValue[];
    shouldDefaultOnClear?: boolean;
    onChange?: (value: HCAutoCompleteOptionValue | undefined) => void;
}

export const HCAutoComplete: React.FC<HCAutoCompleteProps> = ({inputProps, size = 'medium', formControlSx, id, value, onChange, options: items, errorText, helperText, required, label, labelPlacement, vertical, textColor, disabled, shouldDefaultOnClear = false
}) => {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [filteredList, setFilteredList] = React.useState(items);
    const [isHovering, setIsHovering] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [cleared, setCleared] = React.useState(false);

    const [internalValue, setInternalValue] = React.useState<HCAutoCompleteOptionValue | undefined>(value);
    const [search, setSearch] = React.useState<string>(value?.value || '');

    React.useEffect(() => {
        setInternalValue(value);
        setSearch(value?.value || '');
    }, [value]);

    React.useEffect(() => {
        setFilteredList(items);
    }, [items]);

    const resetSearch = React.useCallback(() => {
        setLoading(true);
        setInternalValue(undefined);
        setSearch('');
        setCleared(true);
        if (onChange) {
            onChange(undefined);
        }
        setFilteredList(items);
        setOpen(false);
        setTimeout(() => setLoading(false), 300);
    }, [onChange, items]);

    const idFor = id ?? inputProps?.id;

    const closePopper = React.useCallback(() => {
        setIsHovering(false);
        setOpen(false);
        if (shouldDefaultOnClear && cleared && items.length > 0) {
            setLoading(true);
            const defaultOption = items[0];
            setInternalValue(defaultOption);
            setSearch(defaultOption.value);
            setCleared(false);
            if (onChange) {
                onChange(defaultOption);
            }
            setTimeout(() => setLoading(false), 300);
        }
    }, [shouldDefaultOnClear, cleared, items, onChange]);

    const openPopper = React.useCallback(() => {
        setOpen(true);
        setFilteredList(items);
    }, [items]);

    const onFilterItems = React.useCallback((searchValue: string) => {
        const givenSearchString = searchValue.trim();
        const searchString = searchValue.trim().toLowerCase();
        const filtered = items.filter((o) => o.value.toLowerCase().includes(searchString));
        if (filtered.length === 0) {
            setFilteredList([{
                id: givenSearchString,
                value: `Add "${givenSearchString}"?`,
                new: true,
            }]);
        } else {
            setFilteredList(filtered);
        }
    }, [items]);

    const handleChange = React.useCallback((newValue: HCAutoCompleteOptionValue | null) => {
        setLoading(true);
        if (newValue) {
            setInternalValue(newValue);
            setSearch(newValue.value);
            setCleared(false);
            if (onChange) {
                onChange(newValue);
            }
        } else {
            resetSearch();
        }
        setTimeout(() => setLoading(false), 300);
    }, [onChange, resetSearch]);

    return (
        <Box onMouseLeave={closePopper} onMouseEnter={() => setIsHovering(true)}>
            <HCFormControl disabled={inputProps?.disabled} textColor={textColor} vertical={vertical} formControlSx={formControlSx}{...vertical ? { labelPlacement } : {}} size={size} required={required || inputProps?.required} errorText={errorText} label={label} id={idFor} helperText={helperText}
                input={
                    <Autocomplete
                        id={id}
                        size={size === 'large' ? 'medium' : size}
                        options={filteredList}
                        open={open}
                        disabled={disabled || loading}
                        onOpen={openPopper}
                        onClose={() => setOpen(false)}
                        popupIcon={<KeyboardArrowDown />}
                        getOptionLabel={(option) => option.value}
                        value={internalValue}
                        onChange={(_, newValue) => handleChange(newValue)}
                        inputValue={search}
                        onInputChange={(_, newValue) => {
                            setSearch(newValue);
                            onFilterItems(newValue);
                            if (cleared) {
                                setCleared(false);
                            }
                        }}
                        sx={{
                            '& .MuiAutocomplete-input': {
                                p: 0,
                                fontSize: '16px'
                            }
                        }}
                        slotProps={{
                            paper: {
                                sx: {
                                    bgcolor: '#738085',
                                    borderRadius: 0,
                                    '& .MuiMenuItem-root': {
                                        padding: 2,
                                    },
                                },
                            },
                            popupIndicator: {
                                sx: {
                                    color: theme.palette.primary.main,
                                },
                            },
                        }}
                        renderOption={(props, option) => {
                            const index = filteredList.findIndex((o) => o.id === option.id);
                            return (
                                <React.Fragment key={`${option.id}-${index}`}>
                                    <MenuItem
                                        {...props}
                                        sx={{
                                            height: '30px',
                                            color: Theme.textColor.white,
                                            '&.MuiMenuItem-root': {
                                                py: 0,
                                            },
                                            '&.MuiMenuItem-root.Mui-selected': {
                                                bgcolor: theme.hcPalette.secondary['700']
                                            },
                                        }}
                                        selected={option.id === internalValue?.id}
                                        onClick={() => {
                                            if ((option as HCAutoCompleteOptionValue).new) {
                                                const newOption = {
                                                    id: option.id,
                                                    value: option.id,
                                                };
                                                handleChange(newOption);
                                            } else {
                                                handleChange(option);
                                            }
                                            setOpen(false);
                                        }}
                                    >
                                        {option.value}
                                    </MenuItem>
                                    {index < filteredList.length - 1 && (
                                        <Divider
                                            sx={{
                                                my: 0,
                                                bgcolor: Theme.textColor.white,
                                            }}
                                            variant='middle'
                                        />
                                    )}
                                </React.Fragment>
                            );
                        }}
                        renderInput={(params) => {
                            const { ...inputProps } = params.inputProps;
                            delete inputProps.value;
                            return (
                                <HCTextField
                                    type={'text'}
                                    {...params}
                                    value={loading ? 'Loading...' : search}
                                    inputProps={{
                                        ...params.InputProps,
                                        inputProps: {
                                            ...inputProps,
                                            onBlur() {},
                                            style: {
                                                padding: '0px'
                                            }
                                        },
                                        endAdornment: (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                position: 'absolute',
                                                right: '8px',
                                                top: '50%',
                                                transform: 'translateY(-50%)'
                                            }}>
                                                {loading ? (
                                                    <CircularProgress color="inherit" size={20} />
                                                ) : (
                                                    <>
                                                        {((internalValue && isHovering) || (search && isHovering)) && (
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    resetSearch();
                                                                }}
                                                            >
                                                                <CloseIcon fontSize="small"/>
                                                            </IconButton>
                                                        )}
                                                        {!open ? (
                                                            <KeyboardArrowDown
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openPopper();
                                                                }}
                                                                sx={{
                                                                    color: theme.palette.primary.main,
                                                                    size: size,
                                                                }}
                                                            />
                                                        ) : (
                                                            <KeyboardArrowUp
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpen(false);
                                                                }}
                                                                sx={{
                                                                    color: theme.palette.primary.main,
                                                                    size: size,
                                                                }}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )
                                    }}
                                />
                            );
                        }}
                        filterOptions={(x) => x} // Disable built-in filtering
                    />
                }
            />
        </Box>
    );
};