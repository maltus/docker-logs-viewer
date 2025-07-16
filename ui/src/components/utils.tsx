import {ContainerState, LogLine} from "../api/docker";
import {
    CircleDotsIcon,
    CircleFullIcon,
    LayersTripleIcon,
    CircleHalfFullIcon,
    CircleOutlineFullIcon
} from "./Icon";
import React from "react";
import {CONTAINER_AGGR, ContainerSettings, initSearchResult, SearchPart, SearchResult} from "./model";
import {findAll} from "highlight-words-core";

export const renderContainerIcon = (cs: Readonly<ContainerSettings>) => {
    if (CONTAINER_AGGR === cs.container)
        return <LayersTripleIcon sx={{fontSize: 16}} color="info"/>;

    switch (cs.container.State) {
        case ContainerState.DEAD:
        case ContainerState.CREATED:
            return <CircleDotsIcon sx={{fontSize: 16}} color="disabled"/>;
        case ContainerState.REMOVING:
        case ContainerState.EXITED:
            return <CircleOutlineFullIcon sx={{fontSize: 16}} color="disabled"/>;
        case ContainerState.PAUSED:
            return <CircleHalfFullIcon sx={{fontSize: 16}} color="primary"/>;
        case ContainerState.RESTARTING:
        case ContainerState.RUNNING:
        default:
            return <CircleFullIcon sx={{fontSize: 16}} color="success"/>;
    }
}

export const searchLogLines = (logLines: LogLine[], query: string) => {
    const result = initSearchResult();
    logLines.forEach((logLine, lineIndex) => {
        const chunks = findAll({
            autoEscape: true,
            caseSensitive: true,
            searchWords: [query],
            textToHighlight: logLine.message
        }).filter(_ => _.highlight)

        if (chunks.length > 0) {
            result.total += chunks.length
            const items: SearchPart[] = chunks.map(({highlight, ...chunk}) => ({
                ...chunk,
                rowIdx: lineIndex,
                logId: logLine.logId
            }))
            result.positions.push(...items);
        }
    })

    if (result.positions.length > 0) {
        result.currentPosition = 0
        result.currentRowIdx = result.positions[result.currentPosition].rowIdx
    }

    return result;
}

export const renderSearchStats = (cs: Readonly<ContainerSettings>): string => {
    const currPos = cs.searchResult.currentPosition != null ? cs.searchResult.currentPosition + 1 : 0;
    return `${currPos}/${cs.searchResult.total}`
}
