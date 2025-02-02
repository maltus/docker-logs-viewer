import {ContainerState} from "../api/docker";
import {
    CircleDotsIcon,
    CircleFullIcon,
    LayersTripleIcon,
    CircleHalfFullIcon,
    CircleOutlineFullIcon
} from "./Icon";
import React from "react";
import {CONTAINER_AGGR, ContainerSettings} from "./model";

export const renderContainerIcon = (cs: ContainerSettings) => {
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