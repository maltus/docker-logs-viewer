import * as React from 'react';
import {Typography} from "@mui/material";

export function JsonPretty(props: {message: string}) {
    const {message} = props;
    const isJson = message?.startsWith("{") && message?.endsWith("}");
    const isJsonList = message?.startsWith("[") && message?.endsWith("]");

    return (
        <React.Fragment>
            {isJson || isJsonList
                ?
                <Typography
                    variant="body2"
                    fontFamily={"monospace"}
                >
                    <pre>{JSON.stringify(JSON.parse(message), null, 2)}</pre>
                </Typography>
                : <Typography
                    variant="body2"
                    paddingTop={1}
                    paddingBottom={1}
                    fontFamily={"monospace"}
                >
                    <code>{message}</code>
                </Typography>
            }
        </React.Fragment>
    );
}
