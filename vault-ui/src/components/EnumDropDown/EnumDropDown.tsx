import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase_client';
import { HCDropDown, HCDropDownValue } from 'generic-components';

interface EnumDropDownProps {
    enumName: string;
    label: string;
    onChange?: (value: HCDropDownValue) => void;
    value?: HCDropDownValue;
    required?: boolean;
    inputProps?: React.ComponentProps<typeof HCDropDown>['inputProps'];
}

const EnumDropDown: React.FC<EnumDropDownProps> = ({
    enumName,
    label,
    onChange,
    value,
    required,
    inputProps,
    ...otherProps
}) => {
    const [options, setOptions] = useState<HCDropDownValue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedValue, setSelectedValue] = useState<HCDropDownValue | undefined>(value);

    useEffect(() => {
        const fetchEnumValues = async () => {
            try {
                const { data, error } = await supabase.rpc('get_enum_values', {
                    enum_name: enumName,
                });

                if (error) {
                    console.error(`Error fetching ${enumName} enum values:`, error);
                    setError(error.message);
                    return;
                }

                setOptions(
                    data.map((item: { value: string }, index: number) => ({
                        id: index.toString(),
                        value: item.value,
                    }))
                );
            } catch (err: unknown) {
                console.error(`Unexpected error fetching ${enumName} enum values:`, err);
                const message = err instanceof Error ? err.message : String(err);
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchEnumValues();
    }, [enumName]);

    const handleChange = (selectedOption: HCDropDownValue) => {
        setSelectedValue(selectedOption);
        if (onChange) {
            onChange(selectedOption);
        }
    };


    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <HCDropDown
            label={label}
            onChange={handleChange}
            options={options}
            value={selectedValue}
            required={required}
            inputProps={inputProps}
            {...otherProps}
        />
    );
};

export default EnumDropDown;