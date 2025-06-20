import {Parameters} from '@storybook/react';
// import * as React from 'react';

export function getStoryDescription(key: 'component' | 'story', description: string): Parameters {
    return {
        docs: {
            description: {
                [key]: `${description}\n\nClick on 'Show code' to see an example`
            }
        }
    };
}

export interface HSVColor {
    h: number
    s: number
    v: number
}

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// export const useWhyDidYouUpdate = <T extends Record<string, any>>(name: string, props: T): void => {
//     const previousProps = React.useRef<T>();
//
//     React.useEffect(() => {
//         if (previousProps.current) {
//             const allKeys = new Set([...Object.keys(previousProps.current), ...Object.keys(props)]);
//             const changes: Partial<Record<keyof T, { from: unknown; to: unknown }>> = {};
//
//             allKeys.forEach((key) => {
//                 const k = key as keyof T;
//                 if (previousProps.current![k] !== props[k]) {
//                     changes[k] = {
//                         from: previousProps.current![k],
//                         to: props[k],
//                     };
//                 }
//             });
//
//             if (Object.keys(changes).length) {
//                 console.log(`[why-did-you-update] ${name}`, changes);
//             }
//         }
//
//         previousProps.current = props;
//     }, [name, props]);
// };