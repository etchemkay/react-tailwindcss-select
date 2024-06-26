import React, { useCallback, useContext, useEffect, useMemo } from "react";

import { DEFAULT_THEME } from "../constants";

import DisabledItem from "./DisabledItem";
import GroupItem from "./GroupItem";
import Item from "./Item";
import { SelectContext } from "./SelectProvider";
import { Option, Options as ListOption, GroupOption } from "./type";

interface OptionsProps {
    list: ListOption;
    noOptionsMessage: string;
    text: string;
    isMultiple: boolean;
    value: Option | Option[] | null;
    primaryColor: string;
    filterFn?: (item: Option, searchTerm: string) => boolean;
    sortResults?: (results: ListOption, searchTerm: string) => ListOption;
    activeIndex?: number;
}

const Options: React.FC<OptionsProps> = ({
    list,
    noOptionsMessage,
    text,
    isMultiple,
    value,
    primaryColor = DEFAULT_THEME,
    filterFn,
    sortResults = (results, searchTerm) => results,
    activeIndex: parentActiveIndex
}) => {
    const { classNames } = useContext(SelectContext);
    const [activeIndex, setActiveIndex] = React.useState<number | undefined>(parentActiveIndex);
    const filterByText = useCallback(() => {
        const filterItem =
            typeof filterFn === "function"
                ? (item: Option) => filterFn(item, text)
                : (item: Option) => {
                      return item.label.toLowerCase().indexOf(text.toLowerCase()) > -1;
                  };

        let result = list.map(item => {
            if ("options" in item) {
                return {
                    label: item.label,
                    options: item.options.filter(filterItem)
                };
            }
            return item;
        });

        result = result.filter(item => {
            if ("options" in item) {
                return item.options.length > 0;
            }
            return filterItem(item);
        });

        return result;
    }, [text, list]);

    const removeValues = useCallback(
        (array: ListOption) => {
            if (!isMultiple) {
                return array;
            }

            if (Array.isArray(value)) {
                const valueId = value.map(item => item.value);

                const filterItem = (item: Option) => !valueId.includes(item.value);

                let newArray = array.map(item => {
                    if ("options" in item) {
                        return {
                            label: item.label,
                            options: item.options.filter(filterItem)
                        };
                    }
                    return item;
                });

                newArray = newArray.filter(item => {
                    if ("options" in item) {
                        return item.options.length > 0;
                    } else {
                        return filterItem(item);
                    }
                });

                return newArray;
            }
            return array;
        },
        [isMultiple, value]
    );

    const filterResult = useMemo(() => {
        const results = removeValues(filterByText());
        return sortResults(results, text);
    }, [filterByText, removeValues]);

    useEffect(() => {
        setActiveIndex(parentActiveIndex);
    }, [parentActiveIndex]);

    return (
        <div
            role="options"
            className={classNames && classNames.list ? classNames.list : "max-h-72 overflow-y-auto"}
        >
            {filterResult.map((item, index) => (
                <React.Fragment key={index}>
                    {"options" in item ? (
                        <>
                            <div className="px-2.5">
                                <GroupItem
                                    primaryColor={primaryColor || DEFAULT_THEME}
                                    item={item}
                                />
                            </div>

                            {index + 1 < filterResult.length && <hr className="my-1" />}
                        </>
                    ) : (
                        <div className="px-2.5" onMouseMove={() => setActiveIndex(index)}>
                            <Item
                                isActive={index === activeIndex}
                                primaryColor={primaryColor || DEFAULT_THEME}
                                item={item}
                            />
                        </div>
                    )}
                </React.Fragment>
            ))}

            {filterResult.length === 0 && <DisabledItem>{noOptionsMessage}</DisabledItem>}
        </div>
    );
};

export default Options;
