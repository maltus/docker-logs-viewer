import * as React from 'react';
import {findAll} from "highlight-words-core";
import {Typography} from "@mui/material";
import {v7 as uuidv7} from 'uuid';

export function Highlighted(props: { message: string, searchQuery: string, wrap?: boolean, activeIndex?: number, isExpanded?: boolean }) {
    const {message, searchQuery, wrap, activeIndex, isExpanded} = props;

    const chunks = findAll({
        autoEscape: true,
        caseSensitive: true,
        searchWords: [searchQuery],
        textToHighlight: message
    })

    return (
        <React.Fragment>
            <Typography
                key={`msg-${uuidv7()}`}
                component={"span"}
                fontSize={isExpanded ? 12 : "inherit"}
                fontFamily={isExpanded ? "monospace" : "inherit"}
                style={{whiteSpace: wrap ? 'pre-wrap' : 'nowrap', wordBreak: 'break-word', overflowWrap: "break-word"}}
            >
                {chunks.map(chunk => {
                    const {start, end, highlight} = chunk
                    const msgPart = message.substring(start, end)

                    return chunk.highlight
                        ? <Typography
                            key={`mark=${uuidv7()}`}
                            component={"mark"}
                            style={{backgroundColor: start === activeIndex ? 'orange' : 'yellow'}}
                          >
                            {msgPart}
                          </Typography>
                        : msgPart;
                })}
            </Typography>
        </React.Fragment>
    )
}