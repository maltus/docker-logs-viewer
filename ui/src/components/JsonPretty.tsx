import * as React from 'react';
import {Highlighted} from "./Highlighted";

export function JsonPretty(props: { message: string, searchQuery: string, activeIndex?: number }) {
    const {message, searchQuery, activeIndex} = props;
    const isJson = message?.startsWith("{") && message?.endsWith("}");
    const isJsonList = message?.startsWith("[") && message?.endsWith("]");
    const finalText = isJson || isJsonList ? JSON.stringify(JSON.parse(message), null, 2) : message;

    return (
        <React.Fragment>
            <pre>
                <Highlighted
                    message={finalText}
                    searchQuery={searchQuery}
                    activeIndex={activeIndex}
                    isExpanded={true}
                    wrap={true}
                />
            </pre>
        </React.Fragment>
    );
}
