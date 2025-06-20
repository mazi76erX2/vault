import * as React from 'react';
import {HCFormControlBaseProps} from '../HCFormCommon';
import {DateCalendar} from '@mui/x-date-pickers';
import {AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {MUITheme} from '../theme';
import {Box, Popover, Tooltip, useTheme} from '@mui/material';
import {KeyboardArrowDown} from '@mui/icons-material';
import {HCButton} from '../HCButton';
import {HCTextField} from '../HCTextField';
import {HCIcon} from '../HCIcon';
import moment from 'moment';

export interface HCDatePickerProps extends HCFormControlBaseProps{
    value?: Date | string | number | null;
    onDateChange?(date?: Date): void;
    disabled?: boolean;
    dateError?: string;
    onDateError?(bool: boolean): void;
    minDate?: Date;
    maxDate?: Date;
    readOnly?: boolean;
    placeholder?: string;
    height?: string;
    dateFormat?: string;
    onFocus?: () => void
    onBlur?: () => void;
    saveOnly?: boolean;
    testDefaultOpen?: boolean;
    showErrorMessage?: boolean;
}
const HTML_DATE_FORMAT = 'YYYY/MM/DD';
export const HCDatePicker = React.memo((props: HCDatePickerProps) => {
    const { value, onDateChange, disabled, dateError = '', minDate, maxDate, placeholder, readOnly, height, dateFormat = HTML_DATE_FORMAT, onFocus, onBlur, saveOnly, testDefaultOpen, label, showErrorMessage = true, ...restInputProps} = props;

    const [dateValue, setDateValue] = React.useState<moment.Moment | null>(moment(value, dateFormat).isValid() ? moment(value, dateFormat) : null);

    const [dateValueString, setDateValueString] = React.useState(moment(value, dateFormat).isValid() ? moment(value, dateFormat).format(dateFormat) : '');

    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>();

    const [isDateValid, setIsDateValid] = React.useState(true);

    const [displayTooltip,setDisplayTooltip]=React.useState(false);

    const [isElementFocused, setIsElementFocused] = React.useState(false);

    const theme: typeof MUITheme = useTheme();

    const open = Boolean(anchorEl);

    function onChangeHandler(date?: moment.Moment | null) {
        if (onDateChange && date) {
            onDateChange(date.toDate());
        }
    }

    function handleClose(){
        setAnchorEl(null);
        if (onBlur)
            onBlur();
    }

    React.useEffect(() => {
        if (value && moment(value, dateFormat, true).isValid()) {
            setDateValue(moment(value, dateFormat));
            setDateValueString(moment(value, dateFormat).format(dateFormat));
        }
    }, []);

    React.useEffect(() => {
        if (moment(dateValueString, dateFormat, true).isValid()) {
            const parsedDate = moment(dateValueString, dateFormat, true);
            setDateValue(parsedDate);
            onChangeHandler(parsedDate);
            setIsDateValid(true);
        } else {
            setIsDateValid(false);
        }
    }, [dateValueString]);

    React.useEffect(() => {
        onChangeHandler(dateValue);
    }, [dateValue]);

    const styles: {[key: string]: string | number} = height ? {
        width: '100%',
        height: height,
    } : {
        width: '100%',
    };

    let isTodayEnabled = true;

    if (minDate && moment().toDate() < minDate) {
        isTodayEnabled = false;
    }

    if (maxDate && moment().toDate() > maxDate) {
        isTodayEnabled = false;
    }

    const inputErrorText= dateError ? dateError : (isDateValid ? undefined : dateValueString.length > 0 ? 'Invalid  date' : undefined);
    // Show tooltip when there's an error
    const canShowTooltip = !!inputErrorText && displayTooltip;

    // On hover show tooltip
    const onMouseEnter= ()=>{
        setDisplayTooltip(true);
    };

    // Hide tooltip when mouse leaves the element
    const onMouseLeave= ()=>{
        if(!isElementFocused){
            setDisplayTooltip(false);
        }
    };

    // On Focus show tooltip
    const onElementFocus= ()=>{
        setDisplayTooltip(true);
        setIsElementFocused(true);
        if(onFocus){
            onFocus();  
        }
    };

    // On blur hide tooltip
    const onElementBlur= ()=>{
        setDisplayTooltip(false);
        setIsElementFocused(false);
        if(onBlur){
            onBlur();
        }
    };

    return (
        <Tooltip title={`Invalid date for the required format ${dateFormat}`} open={canShowTooltip} placement='top' arrow
            slotProps={{
                tooltip: {
                    sx: label // Checks if the label is present then add margin
                        ? {
                            marginBottom: '-55px !important',
                        }
                        : {}, // No margin if no label exists
                },
            }}
        >
            <div style={styles}>
                <HCTextField
                    errorText={showErrorMessage ? inputErrorText : undefined}
                    inputProps={{
                        onFocus: onElementFocus,
                        onBlur: onElementBlur,
                        onMouseEnter:onMouseEnter,
                        onMouseLeave:onMouseLeave,
                        readOnly: readOnly,
                        endAdornment: (
                            <button onClick={(e) => {
                                if (disabled) return;
                                setAnchorEl(e.currentTarget as HTMLElement);
                                if (onFocus)
                                    onFocus();
                            }} disabled={disabled} style={{
                                appearance: 'none',
                                background: 'transparent',
                                border: 'none',
                                padding: '0px'
                            }}>
                                <HCIcon icon={'Calendar'} />
                            </button>
                        ),
                        disabled,
                        // type: 'date',
                        pattern: dateFormat,
                        placeholder: placeholder ? placeholder : dateFormat,
                    }}
                    label={label}
                    {...restInputProps}
                    onChange={({target}) => {
                        setDateValueString(target.value);
                    }}
                    type={'text'}
                    value={dateValueString}
                />
                {(testDefaultOpen || anchorEl) && (
                    <Popover open={open} anchorEl={anchorEl} onClose={handleClose}>
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                            <Box sx={{
                                width: '342px',
                                p: '16px'
                            }}>
                                <DateCalendar
                                    disabled={disabled}
                                    defaultValue={moment()} value={dateValue} slots={{
                                        switchViewIcon: KeyboardArrowDown,
                                    }} slotProps={{
                                        day: {
                                            // Double-click on date to close date picker
                                            onDoubleClick: ((event : React.MouseEvent<HTMLButtonElement>) => {
                                                const {currentTarget} = event;
                                                // Check if mui-selected class exist then close the date picker
                                                if (currentTarget && currentTarget.classList.contains('Mui-selected')){
                                                    handleClose();
                                                }
                                            }),
                                        },
                                        nextIconButton: {
                                            sx: {
                                                color: theme.hcPalette.primary['500']!['hex'],
                                            }
                                        },
                                        previousIconButton: {
                                            sx: {
                                                color: theme.hcPalette.primary['500']!['hex'],
                                            }
                                        },
                                        switchViewIcon: {
                                            sx: {
                                                color: theme.hcPalette.primary['500']!['hex'],
                                            }
                                        },
                                    }} onChange={(value) => {
                                        setDateValue(value);
                                        onChangeHandler(value);
                                        setDateValueString(moment(value ?? new Date()).format(dateFormat));
                                        setIsDateValid(true);
                                    }} minDate={minDate ? moment(minDate) : undefined} maxDate={maxDate ? moment(maxDate) : undefined} dayOfWeekFormatter={(weekday) => `${weekday.format('dddd').substring(0,3)}`} />
                                <Box sx={{
                                    display: 'flex',
                                }}>
                                    <HCButton
                                        onClick={() => {
                                            setDateValue(null);
                                            setDateValueString('');
                                            setIsDateValid(true);
                                            if (onDateChange)
                                                onDateChange();
                                        }} hcVariant={'tertiary'} text={'CLEAR'} size={'small'}
                                        disabled={disabled}
                                    />
                                    <Box sx={{
                                        flex: 1,
                                    }} />
                                    {saveOnly ? (
                                        <HCButton
                                            onClick={() => {
                                                onChangeHandler(dateValue);
                                                handleClose();
                                            }} hcVariant={'primary'} text={'SAVE'}
                                            size={'small'}
                                        />
                                    ) : (
                                        <HCButton
                                            onClick={() => {
                                                setDateValue(moment());
                                                setDateValueString(moment().format(dateFormat));
                                                setIsDateValid(true);
                                                onChangeHandler(moment());
                                            }} hcVariant={'primary'} text={'TODAY'} size={'small'} disabled={!isTodayEnabled || disabled}
                                        />
                                    )}
                                </Box>
                            </Box>
                        </LocalizationProvider>
                    </Popover>
                )}
            </div>
        </Tooltip>
      
    );
});

HCDatePicker.displayName = 'HCDatePicker';
