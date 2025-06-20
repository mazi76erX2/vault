import * as React from 'react';
import {Autocomplete, Box, Chip, TextField, Tooltip, useTheme} from '@mui/material';
import {HCFormControl, HCFormControlBaseProps} from '../HCFormCommon';
import {HCIcon} from '../HCIcon';
import {KeyboardArrowDown} from '@mui/icons-material';
import {useEffect} from 'react';

export interface HCTagSelectionOptionValue {
    companyRegNo: string;
    id: string;
    name: string;
    queryId: string;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface HCTagSelectionProps extends HCFormControlBaseProps {
    label: string;
    selectedTags: HCTagSelectionOptionValue[];

    onChange?(value: HCTagSelectionOptionValue[]): void;

    minWidth?: string | number;
    maxWidth?: string | number;
    options: HCTagSelectionOptionValue[];
    preventAdd?: boolean;
    onDropdownClick?: () => void;
}

interface TagsDTO {
    companyRegNo: string;
    id: string;
    name: string;
    queryId: string;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const HCTagSelection = React.memo(({
    size = 'medium',
    selectedTags,
    id,
    onChange,
    options: items,
    disabled,
    label,
    maxWidth,
    preventAdd,
    onDropdownClick
}: HCTagSelectionProps) => {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [tags, setTags] = React.useState<HCTagSelectionOptionValue[]>([]);
    const [value, setValue] = React.useState<string>('');

    const [filteredList, setFilteredList] = React.useState<TagsDTO[]>([]);
    React.useEffect(() => {
        setFilteredList(items);
    }, [items]);

    useEffect(() => {
        setTags(selectedTags);
    }, [selectedTags]);

    const closePopper = () => {
        setOpen(false);
        if (onDropdownClick) {
            onDropdownClick();
        }
    };
    const handleMouseLeave = () => {
        if (open) {
            closePopper();
        }
    };

    const openPopper = () => {
        setOpen(true);
        if (onDropdownClick) {
            onDropdownClick();
        }

    };

    const onFilterItems = (search: string) => {
        const filtered = items.filter((o) => o.name.toLowerCase().indexOf(search.toLowerCase()) > -1);
        if (filtered.length === 0 && search.trim().length > 0 && !preventAdd) {
            if (selectedTags.findIndex((item) => item.name === search) === -1 && filtered.findIndex((item) => item.name === search) === -1) {
                setFilteredList([{
                    companyRegNo: '',
                    id: '',
                    name: search.trim(),
                    queryId: ''
                }]);
            }
        } else {
            setFilteredList(filtered);
        }
    };

    return (
        <Box onMouseLeave={handleMouseLeave}>
            <HCFormControl label={label} size={size} id={id} input={
                <Autocomplete
                    value={selectedTags && selectedTags.sort((a, b) => a.name.length - b.name.length) || []}
                    multiple
                    limitTags={2}
                    id={id}
                    size={size === 'large' ? 'medium' : size}
                    options={filteredList}
                    open={open}
                    disabled={disabled}
                    onOpen={openPopper}
                    popupIcon={
                        <KeyboardArrowDown
                            onClick={(e) => {
                                e.stopPropagation();
                                if (open) {
                                    closePopper();
                                } else {
                                    openPopper();
                                }
                            }}
                        />
                    }
                    onChange={(_event, value) => {
                        setTags(value);
                        if (onChange) {
                            onChange(value);
                        }
                    }}
                    onClose={closePopper}
                    getOptionLabel={(option) => option.name}
                    sx={{
                        '& .MuiAutocomplete-input': {
                            p: 0,
                        },
                        maxWidth: maxWidth || '100%'
                    }}
                    slotProps={{
                        paper: {
                            sx: {
                                bgcolor: theme.hcPalette.secondary['500']!['hex'],
                                borderRadius: 0,
                                '& .MuiMenuItem-root': {
                                    padding: 2,
                                    '&:hover': {
                                        bgcolor: 'transparent', // Remove hover background color
                                    },
                                    '&.Mui-focused': {
                                        bgcolor: 'transparent', // Remove focus background color
                                    },
                                    '&:active': {
                                        bgcolor: 'transparent', // Remove active background color
                                    },
                                },
                            },
                        },
                        popupIndicator: {
                            sx: {
                                color: theme.palette.primary.main,
                                borderRadius: 0,
                                background: 'none'
                            },
                        },
                    }}
                    ListboxProps={{
                        sx: {
                            background: theme.hcPalette.neutralVariant['500']!['hex'],
                            width: '100%'
                        },
                    }}
                    renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'contents'
                                }}
                            >
                                <Tooltip title={option.name}>
                                    <Chip
                                        sx={{
                                            borderRadius: '5px',
                                            backgroundColor: theme.hcPalette.secondary['700']!['hex'],
                                            color: theme.hcPalette.neutralVariant['500']!['hex'],
                                            '& .MuiChip-label': {
                                                margin: '10px',
                                                paddingLeft: '5px'
                                            }
                                        }}
                                        deleteIcon={<HCIcon icon={'Close'}
                                            style={{
                                                position: 'absolute',
                                                right: '0px',
                                                marginRight: '2px',
                                                height: '20px',
                                                color: theme.hcPalette.neutralVariant['500']!['hex']
                                            }}
                                        />}
                                        label={option.name}
                                        {...getTagProps({index})}
                                    />
                                </Tooltip>
                            </div>
                        ))
                    }
                    renderInput={(params) => {
                        const {...inputProps} = params.inputProps;
                        delete inputProps.value;

                        return (
                            <TextField
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 0,
                                        background: theme.hcPalette.neutralVariant['500']!['hex'],
                                        height: 'auto',
                                        padding: 0,
                                        paddingLeft: '3px',
                                        flexGrow: 1,
                                        '&.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'transparent',
                                            color: theme.textColor.black,
                                            borderRadius: 0,
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: theme.hcPalette.primary['500']!['hex']
                                        },
                                    },
                                }}
                                onKeyDown={(ev) => {
                                    if (ev.key === 'Enter') {
                                        ev.preventDefault();
                                        if (onChange) {
                                            const v = value.trim();
                                            if (v === '') {
                                                return;
                                            }
                                            const foundValue = filteredList.find((o) => o.name.toLowerCase() === v.toLowerCase());
                                            if (foundValue) {
                                                const t = [...tags];
                                                t.push(foundValue);
                                                onChange(t);
                                                setValue('');
                                            } else {
                                                if (!preventAdd) {
                                                    const val = {
                                                        companyRegNo: '',
                                                        id: '',
                                                        name: v,
                                                        queryId: ''
                                                    };
                                                    const t = [...tags];
                                                    if (t.findIndex((item) => item.name === v) === -1)
                                                        t.push(val);

                                                    onChange(t);
                                                    setValue('');
                                                }
                                            }
                                        }
                                    }
                                }}
                                {...params}
                            />
                        );
                    }}
                    onInputChange={(_event, v) => {
                        setValue(v);
                        onFilterItems(v);
                    }}
                    filterSelectedOptions
                />
            }
            />
        </Box>
    );
});

HCTagSelection.displayName = 'HCTagSelection';
