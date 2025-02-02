import React, {useEffect} from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import {
    Divider,
    FormControlLabel,
    Grid2 as Grid,
    Paper,
    Switch,
    Tooltip,
    Typography
} from '@mui/material';
import {DockerApi} from "../api/docker-api";
import {LogID, LogLine, sortContainers, sortLogs} from "../api/docker";
import {LogViewTable} from "./LogViewTable";
import {TableVirtuosoHandle} from "react-virtuoso";
import {
    CONTAINER_AGGR,
    ContainerSettings,
    initContainerSettings,
    initContainerSettingsList,
    logFilterPredicate,
    truncate
} from "./model";
import {renderContainerIcon} from "./utils";

export function App() {
    const [tabValue, setTabValue] = React.useState(0);

    const [containerSettings, setContainerSettings] = React.useState(initContainerSettingsList);
    const [logs, setLogs] = React.useState<LogLine[]>([]);
    const [expandedRows, setExpandedRows] = React.useState<LogID[]>([]);

    const tableRef = React.useRef<TableVirtuosoHandle | undefined>();

    const isExpandedRow = (logId: LogID) => expandedRows.includes(logId);
    const onExpandRow = (logId: LogID) => {
        if (isExpandedRow(logId)) {
            setExpandedRows(expandedRows.filter(_ => _ !== logId));
        } else {
            setExpandedRows([...expandedRows, logId]);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);

        containerSettings[newValue]?.followOutput && tableRef?.current?.scrollToIndex({
            align: "end",
            behavior: "auto",
            index: "LAST"
        });
    };

    const updateCurrentContainerSettings = (params: Partial<Omit<ContainerSettings, "container">>) => {
        const newSettings = containerSettings.slice();
        const curr = newSettings[tabValue]
        newSettings[tabValue] = {...curr, ...params}
        setContainerSettings(newSettings)
    }

    const handleShowTimestampChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateCurrentContainerSettings({showTimestamp: event.target.checked});
    };

    const handleShowStdOutChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateCurrentContainerSettings({showStdout: event.target.checked});
    };

    const handleShowStdErrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateCurrentContainerSettings({showStderr: event.target.checked});
    };

    const handleFollowOutputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateCurrentContainerSettings({followOutput: event.target.checked});

        event.target.checked && tableRef?.current?.scrollToIndex({
            align: "end",
            behavior: "auto",
            index: "LAST"
        });
    };

    useEffect(() => {
        DockerApi.getAllContainers().then(containerList => {
            sortContainers(containerList);

            const initCSList = initContainerSettingsList()
            containerList.forEach(container => {
                initCSList.push(initContainerSettings(container))

                DockerApi.getContainerLogs(container, (logLine: LogLine) => {
                    if (!logs.find(_ =>
                        _.timestampStr === logLine.timestampStr &&
                        _.message === logLine.message &&
                        _.containerId === logLine.containerId)) {
                        setLogs((current) => [...current, logLine]);
                    }
                })
            });

            setContainerSettings(initCSList);
        });
    }, []);

    const currentSettings = containerSettings[tabValue]
    const currentLogs = logs.filter(_ => logFilterPredicate(_, currentSettings));
    sortLogs(currentLogs);

    return (
        <Box key="main-box">
            <Typography
                data-testid="heading"
                variant="h4"
                role="title"
            >
                Logs Viewer
            </Typography>
            <Typography
                data-testid="subheading"
                variant="body2"
                color="text.secondary"
            >
                View logs from all containers
            </Typography>

            <Divider/>

            <Box sx={{width: '100%', height: '100%'}}>
                <Tabs
                    value={tabValue}
                    defaultValue={0}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    textColor="secondary"
                    indicatorColor="primary"
                    aria-label="scrollable auto icon position tabs"
                >
                    {containerSettings.map(cs => (
                        <Tooltip key={`tab-tooltip-${cs.container.ID}`}
                                 title={cs.container.Names}
                                 placement={"top"}
                                 arrow>
                            <Tab
                                icon={renderContainerIcon(cs)}
                                key={`tab-${cs.container.ID}`}
                                iconPosition="start"
                                label={truncate(cs.container.Names)}
                            />
                        </Tooltip>
                    ))}
                </Tabs>

                <Divider/>

                <Paper style={{height: window.innerHeight - 180, width: '100%', border: 0}}>
                    <LogViewTable
                        tableRef={tableRef}
                        context={{
                            showTimestamp: currentSettings.showTimestamp,
                            showAllLogs: currentSettings.container.ID === CONTAINER_AGGR.ID,
                            followOutput: currentSettings.followOutput,
                            setFollowOutput: (param: boolean) => updateCurrentContainerSettings({followOutput: param}),
                            isExpandedRow: isExpandedRow,
                            onExpandRow: onExpandRow
                        }}
                        data={currentLogs}
                    />
                </Paper>

                <Box flexGrow={2}>
                    <Grid
                        container
                        justifyContent="space-between"
                        alignItems="center"
                        flexDirection={{xs: 'column', sm: 'row'}}
                        size={6}
                    >
                        <Grid
                            sx={{order: {xs: 2, sm: 1}}}
                        >
                            <Typography
                                paddingTop={2}
                                color={"primary"}
                                fontStyle={"italic"}
                            >
                                {currentLogs.length} lines
                            </Typography>
                        </Grid>
                        <Grid
                            container
                            columnSpacing={1}
                            sx={{order: {xs: 1, sm: 2}}}
                        >
                            <Grid>
                                <FormControlLabel
                                    label="timestamp"
                                    labelPlacement={"top"}
                                    control={
                                        <Switch
                                            size={"small"}
                                            checked={currentSettings.showTimestamp}
                                            onChange={handleShowTimestampChange}/>
                                    }
                                />
                            </Grid>
                            <Grid>
                                <FormControlLabel
                                    label="stdout"
                                    labelPlacement={"top"}
                                    control={
                                        <Switch
                                            size={"small"}
                                            checked={currentSettings.showStdout}
                                            onChange={handleShowStdOutChange}/>
                                    }
                                />
                            </Grid>
                            <Grid>
                                <FormControlLabel
                                    label="stderr"
                                    labelPlacement={"top"}
                                    control={
                                        <Switch
                                            size={"small"}
                                            checked={currentSettings.showStderr}
                                            onChange={handleShowStdErrChange}
                                        />
                                    }
                                />
                            </Grid>
                            <Grid>
                                <FormControlLabel
                                    label="follow output"
                                    labelPlacement={"top"}
                                    control={
                                        <Switch
                                            size={"small"}
                                            checked={currentSettings.followOutput}
                                            onChange={handleFollowOutputChange}
                                        />
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}
