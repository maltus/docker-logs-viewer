import {
    Chip,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip
} from "@mui/material";
import {ChevronDownIcon, ChevronUpIcon, ExclamationThickIcon} from "./Icon";
import {columns, truncate} from "./model";
import {JsonPretty} from "./JsonPretty";
import {TableComponents, TableVirtuoso} from "react-virtuoso";
import {LogLine} from "../api/docker";
import React from "react";
import randomColor from "randomcolor";

const COLORS_MAP = new Map<string, string>()

const ExpandableTableRow = (props: any) => {
    const {context, item: logLine, ...otherProps} = props;
    const isExpanded = context.isExpandedRow(logLine.logId);
    const showTimestamp = context.showTimestamp;
    const showAllLogs = context.showAllLogs;
    const color = COLORS_MAP.get(logLine.containerId) || randomColor({luminosity: 'light'});
    COLORS_MAP.set(logLine.containerId, color)

    return (
        <>
            <TableRow hover sx={{p: 0, m: 0}} {...otherProps}>
                <TableCell style={{verticalAlign: 'top'}}>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        sx={{p: 0, m: 0}}
                        onClick={() => context.onExpandRow(logLine.logId)}
                    >
                        {isExpanded
                            ? <ChevronUpIcon sx={{fontSize: 18}}/>
                            : <ChevronDownIcon sx={{fontSize: 18}}/>
                        }
                    </IconButton>
                    {logLine.isStderr && (
                        <Tooltip
                            title='stderr'
                            arrow
                        >
                            <ExclamationThickIcon
                                sx={{fontSize: 12, m: 0, p: 0}}
                                color="error"/>
                        </Tooltip>
                    )}
                </TableCell>
                {
                    showTimestamp &&
                    <TableCell
                        sx={{color: "gray", verticalAlign: 'top'}}
                    >
                        {logLine.timestampStr.replaceAll('T', ' ').replaceAll('Z', '')}
                    </TableCell>
                }
                {
                    showAllLogs &&
                    <TableCell style={{verticalAlign: 'top'}}>
                        <Chip
                            label={truncate(logLine.containerName, 15)}
                            sx={{
                                background: color,
                                "& .MuiChip-label": {
                                    textTransform: "lowercase",
                                    fontSize: 12,
                                    filter: 'invert(1)',
                                    mixBlendMode: 'difference'
                                }
                            }}
                            size={"small"}
                        />
                    </TableCell>
                }
                <TableCell>
                    {isExpanded ? <JsonPretty message={logLine.message}/> : logLine.message}
                </TableCell>
            </TableRow>
        </>
    );
};

const COMPONENTS: TableComponents<LogLine> = {
    Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
        <TableContainer sx={{height: window.innerHeight, border: 0}} {...props} ref={ref}/>
    )),
    Table: (props) => (
        <Table
            {...props}
            stickyHeader
            aria-label="sticky table"
            size="small"
            padding={"none"}
        />
    ),
    TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableHead {...props} ref={ref}/>
    )),
    TableRow: ExpandableTableRow,
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableBody {...props} ref={ref}/>
    )),
};

function fixedHeaderContent(props: { context: any }) {
    const actualColumns = columns.filter(_ => {
        if (!props.context.showTimestamp && _.id === 'timestamp') return false
        else if (!props.context.showAllLogs && _.id === 'container') return false

        return true
    });

    return () => (
        <TableRow>
            {actualColumns.map((column) => (
                <TableCell
                    key={`col-${column.id}`}
                    variant={"head"}
                    align={column.align}
                    style={{width: column.minWidth}}
                >
                    {column.label}
                </TableCell>
            ))}
        </TableRow>
    );
}

export function LogViewTable(props: { data: readonly LogLine[], context: any, tableRef: any }) {
    return (
        <TableVirtuoso
            ref={props.tableRef}
            key={"table-logs-viewer"}
            context={props.context}
            data={props.data}
            components={COMPONENTS}
            fixedHeaderContent={fixedHeaderContent({context: props.context})}
            totalCount={props.data.length}
            followOutput={(bottom) => {
                if (bottom || props.context.followOutput) return "auto"
                else return false
            }}
            increaseViewportBy={{top: 50, bottom: 0}}
            initialTopMostItemIndex={{
                align: "end",
                behavior: "auto",
                index: "LAST"
            }}
            atBottomThreshold={2}
            atBottomStateChange={(bottom) => {
                if (!bottom && props.context.followOutput) {
                    props.context.setFollowOutput(false);
                }
                if (bottom && !props.context.followOutput) {
                    props.context.setFollowOutput(true);
                }
            }}
        />
    );
}