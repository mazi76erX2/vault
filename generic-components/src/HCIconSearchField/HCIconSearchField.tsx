import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material';
import { Icon as IconSet } from '../icons';
import { FaIcons } from '../fa-icons';
import { LuiIcons } from '../lui-icons';
import TCIcon from '../assets/TrueChart_icon.svg';
import FaFlagIcon from '../assets/font-awesome-icon.svg';
import LuiIcon from '../assets/lui-icon.svg';
import { HCButtonIcon, HCButtonIconType } from '../HCIcon';
import { INSERT_INLINE_ICON_COMMAND } from './InlineIconNode';
import {
    LexicalEditor,
    $getSelection,
    $isRangeSelection,
    // $insertNodes,
    // $setSelection,
    RangeSelection,
    COMMAND_PRIORITY_NORMAL,
} from 'lexical';
import {Tooltip} from '@mui/material';

// Enum representing the available icon packs for selection in the icon picker.
enum IconPack {
    TRUECHART = 'TRUECHART',
    FontAwesome = 'FontAwesome',
    LeonardoUI = 'Leonardo UI',
}

export interface CellIconProps {
    style: React.CSSProperties;
    name: string;
}

interface IconSearchFieldProps {
    placeholder?: string;
    editor: LexicalEditor; // The Lexical editor instance to insert icons
    onIconSelection?: (selectedIcon?: CellIconProps) => void;
    isIconSelected?:boolean;
 }

export const HCIconSearchField: React.FC<IconSearchFieldProps> = ({
    placeholder,
    editor,
    onIconSelection,
    isIconSelected,
}) => {
    const [searchValue, setSearchValue] = useState('');
    const [filterIcons, setFilterIcons] = useState<IconPack | null>(IconPack.TRUECHART); // Tracks the currently selected icon pack

    // Handles input field changes for searching icons
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        setSearchValue(inputValue);
    };

    // Clears the search field when clicking the 'X' button
    const onClearSearch = () => {
        setSearchValue('');
    };

    // Filtering icons based on search value
    const hcIconList = React.useMemo(() => {
        return Object.keys(IconSet)
            .sort()
            .filter((key) => key.toLowerCase().includes(searchValue.toLowerCase()));
    }, [searchValue]);

    const faIconList = React.useMemo(() => {
        return Object.keys(FaIcons)
            .sort()
            .filter((key) => key.toLowerCase().includes(searchValue.toLowerCase()));
    }, [searchValue]);

    const luiIconList = React.useMemo(() => {
        return Object.keys(LuiIcons)
            .sort()
            .filter((key) => key.toLowerCase().includes(searchValue.toLowerCase()));
    }, [searchValue]);

    // Determines which icon list to show based on the selected icon pack
    let icons: string[] = [];
    switch (filterIcons) {
    case IconPack.TRUECHART:
        icons = hcIconList;
        break;
    case IconPack.FontAwesome:
        icons = faIconList;
        break;
    case IconPack.LeonardoUI:
        icons = luiIconList;
        break;
    }

    // Converts a given font size (in pixels) to an appropriate width for an icon
    const convertFontToWidth = (fontSize: string) => {
        const width = Number(fontSize.replace('px', '')) * 1.2;
        return `height: auto; width: ${width}px;`;
    };

    // Converts an inline CSS string into a React-compatible style object
    function convertInlineCSSToReactStyle(inlineCSS: string): React.CSSProperties {
        return inlineCSS
            .split(';') //Split the css string into separate property declarations
            .map((prop) => prop.trim())
            .filter((prop) => prop) // remove empty properties
            .reduce((acc, prop) => {
                const [key, value] = prop.split(':').map((p) => p.trim()); //separate key and value
                if (!key || !value) return acc; // Skip if there is no value or key

                // Convert CSS property to camelCase (e.g., "font-size" → "fontSize")
                const camelCaseKey = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

                // Assign the converted key and value to the result object
                acc[camelCaseKey] = value;

                return acc;
            }, {} as Record<string, string>);
    }

    // Computes styles for icons, ensuring they match the text's font size and color
    const computeStyles = (styles: string, iconPack: IconPack | null) => {
        let newStyles = styles;

        if (iconPack === IconPack.TRUECHART) {
            const iconStyles = styles.split(';').map((style) => {
                const [key, value] = style.split(':');

                // Adjusts icon size based on the selected text's font size
                if (key === 'font-size') {
                    return convertFontToWidth(value);
                }

                return style + ';';  //keep other styles
            });

            newStyles = iconStyles.join(''); //Join the updated style string
        }
        // Convert the final inline CSS string to a React-compatible style object
        return convertInlineCSSToReactStyle(newStyles);
    };

    const onRemoveIcon = () => {
        if (onIconSelection) {
            onIconSelection();
        }
    };

    // Registers a command to insert an inline icon into the text editor
    useEffect(() => {
        return editor.registerCommand(
            INSERT_INLINE_ICON_COMMAND,
            (iconPath: string) => {
                editor.update(() => {
                    const selection = $getSelection();

                    // Check if the current selection is a range selection (text is highlighted) then assign selection to rangeSelection
                    if ($isRangeSelection(selection)) {
                        const rangeSelection = selection as RangeSelection;

                        // Move the cursor to position 0 (beginning of the selection)
                        rangeSelection.anchor.offset = 0;
                        rangeSelection.focus.offset = 0;

                        // Compute the styles for the selected text range, filtering out any existing icon-related styles
                        const styles = computeStyles(rangeSelection.style, filterIcons);
                        // checks if onIconSelection exists, invoke it with the updated styles and selected icon name
                        if (onIconSelection) {
                            onIconSelection({
                                style:styles,
                                name:iconPath,
                            });
                        }
                    }
                });
                return true;
            },
            COMMAND_PRIORITY_NORMAL
        );
    }, [editor, filterIcons]);

    // Handles selecting an icon from the search panel
    const onIconSelect = (iconPath: string) => {
        editor.dispatchCommand(INSERT_INLINE_ICON_COMMAND, iconPath);

        setSearchValue('');
    };

    // Automatically selects an icon if there's only one search result and the user presses "Enter"
    const onEnter = (event: React.KeyboardEvent<HTMLInputElement>, iconList: string[]) => {
        if (iconList.length === 1 && event.key === 'Enter') {
            onIconSelect(iconList[0]);
        }
    };

    return (
        <IconPickerDiv>
            <div className='search-iconfilters-container'>

                <Tooltip
                    title={isIconSelected ? 'Remove the existing icon before adding a new one' : ''}
                    disableHoverListener={!isIconSelected}
                    disableFocusListener={!isIconSelected}
                    placement={'top-start'}
                    PopperProps={{
                        sx: {
                            zIndex: 150001,
                            marginLeft: '-15px !important',
                            marginBottom: '-9px !important',
                        },
                    }}
                    arrow
                >
                    <div className={`search-field-container ${isIconSelected ? 'disabled' : ''}`}>
                        <input
                            type="text"
                            className="search-field-input"
                            placeholder={placeholder}
                            value={searchValue}
                            onKeyUp={(e) => onEnter(e, icons)}
                            onChange={onChange}
                            disabled={isIconSelected}
                        />

                        <button
                            type="button"
                            className="search-field-icon"
                            onClick={onClearSearch}
                            aria-label="Clear search field"
                            disabled={isIconSelected}
                        >
                            {searchValue ? <CloseIcon/> : <SearchIcon/>}
                        </button>
                    </div>
                </Tooltip>

                {/*Icon filter buttons*/}
                <div className="icon-filters">
                    {
                        !isIconSelected ? (
                            <>
                                <button
                                    className={`truechat-icons bar-icon-item ${filterIcons === IconPack.TRUECHART ? 'active' : ''}`}
                                    onClick={() => setFilterIcons(IconPack.TRUECHART)}
                                >
                                    <img src={TCIcon} alt="TC Icon"/>
                                </button>
                                <button
                                    className={`fontawesome-icons bar-icon-item ${filterIcons === IconPack.FontAwesome ? 'active' : ''}`}
                                    onClick={() => setFilterIcons(IconPack.FontAwesome)}
                                >
                                    <img src={FaFlagIcon} alt="Fa Icon"/>
                                </button>
                                <button
                                    className={`leornado-icons bar-icon-item ${filterIcons === IconPack.LeonardoUI ? 'active' : ''}`}
                                    onClick={() => setFilterIcons(IconPack.LeonardoUI)}
                                >
                                    <img src={LuiIcon} alt="Lui Icon"/>
                                </button>
                            </>
                        ) : (
                            <Tooltip
                                title='Remove Icon'
                                disableHoverListener={!isIconSelected}
                                disableFocusListener={!isIconSelected}
                                PopperProps={{
                                    sx: {
                                        zIndex: 150001,
                                        marginLeft: '-3px !important',
                                        marginBottom: '-5px !important',
                                        maxWidth:'70px !important',

                                        '& .MuiTooltip-tooltip': {
                                            padding: '4px !important',
                                        },
                                    },
                                }}
                                placement={'top-start'}
                                arrow
                            >
                                <button className='bar-icon-item remove-icon' onClick={onRemoveIcon}>
                                    <CloseIcon/>
                                </button>
                            </Tooltip>
                        )
                    }
                </div>
            </div>

            {/* Icon search results */}
            {icons.length > 0 && searchValue.trim().length > 0 && (
                <div className="icon-results">
                    {icons.map((icon, index) => (
                        <button key={`icon-${index}`} onClick={() => onIconSelect(icon)} className="icon-item">
                            <HCButtonIcon icon={icon as HCButtonIconType} className="btn-icon-item"/>
                        </button>
                    ))}
                </div>
            )}
        </IconPickerDiv>
    );
};

const IconPickerDiv = styled('div')`
    display: flex;
    align-items: center;
    flex: 1;
    position: relative;
    max-width: 537px;
    
    .search-iconfilters-container {
        display: flex;
        align-items: center;
    }

    .search-field-container {
        display: flex;
        flex: 1;
        position: relative;
        border: 2px solid #000;
        border-radius: 5px;
        max-height: 25px;

        &.disabled{
            border-color: #e3e3e3;
        }

        .search-field-input {
            box-sizing: border-box;
            border: none;
            font-weight: 400;
            font-size: 13px;
            color: #777;
            width: 100%;
            height: 100%;
            outline: none;
            
            &:disabled{
                background: #f6f2f2;
                color: #f6f2f2;
                cursor: not-allowed;
            }
        }

        .search-field-icon {
            background: #fff;
            border: none;
            width: 18px;
            height: 100%;
            position: absolute;
            right: 0;
            padding: 0;
            display: flex;
            align-items: center;
            cursor: pointer;
            
            &:disabled{
                background: #f6f2f2;
                cursor: not-allowed;
            }

            svg {
                width: 15px;
                height: 15px;
            }
        }
    }

    .icon-filters {
        display: flex;
        align-items: center;
        margin-left: 2px;
        column-gap: 2px;

        .bar-icon-item {
            border: none;
            background: #fff;
            height: 22px;
            width: 23px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            
            &.active{
                background: #d5d5d5;
                border-radius: 6px;
            }
            
            &:hover{
                background: #eeeeee;
                border-radius: 6px;
            }
            

            img{
                height: 20px;
            }
        }
        
        }
    }

.icon-results{
    position: absolute;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, auto);
    justify-content: center;
    width: 133px;
    height: 116px;
    margin-left: 2px;
    background: #fff;
    box-shadow: 1px 1px 1px #ddd;
    left: 0;
    top: 0;
    translate: 0 38px;
    gap: 7px;
    overflow: auto;
    padding: 7px 2px 5px 8px;;
    
    .icon-item{
        display: inline-flex;
        height: 20px;
        width: 25px;
        justify-content: center;
        align-items: center;
        border: none;
        background: transparent;
        padding:0;
        
        .btn-icon-item{
            cursor:pointer
        }
        
        i{
            font-size: 18px;
        }
    }
`;

