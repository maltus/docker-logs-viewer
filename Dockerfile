FROM --platform=$BUILDPLATFORM node:22.17.0-alpine3.22 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
RUN npm run build

FROM alpine
LABEL org.opencontainers.image.title="Logs Viewer" \
    org.opencontainers.image.description="Comfortable logs viewer for docker containers" \
    org.opencontainers.image.vendor="maltus" \
    com.docker.desktop.extension.api.version="0.4.2" \
    com.docker.extension.screenshots="[\
    {\"alt\": \"all tabs\", \"url\": \"https:\/\/raw.githubusercontent.com\/maltus\/docker-logs-viewer\/refs\/heads\/main\/docs\/logs_viewer_home.png\"},\
    {\"alt\": \"search logs\", \"url\": \"https:\/\/raw.githubusercontent.com\/maltus/docker-logs-viewer\/refs\/heads\/main\/docs\/logs_viewer_search.png\"},\
    {\"alt\": \"container_tab\", \"url\": \"https:\/\/raw.githubusercontent.com\/maltus\/docker-logs-viewer\/refs\/heads\/main\/docs\/logs_viewer_container_tab.png\"},\
    {\"alt\": \"show json single item\", \"url\": \"https:\/\/raw.githubusercontent.com\/maltus\/docker-logs-viewer\/refs\/heads\/main\/docs\/logs_viewer_json_expanded.png\"},\
    {\"alt\": \"show json list items\", \"url\": \"https:\/\/raw.githubusercontent.com\/maltus\/docker-logs-viewer\/refs\/heads\/main\/docs/logs_viewer_json_multiple.png\"},\
    {\"alt\": \"without timestamp\", \"url\": \"https:\/\/raw.githubusercontent.com\/maltus\/docker-logs-viewer\/refs\/heads\/main\/docs/logs_viewer_no_timestamp.png\"},\
    {\"alt\": \"no wrap\", \"url\": \"https:\/\/raw.githubusercontent.com\/maltus\/docker-logs-viewer\/refs\/heads\/main\/docs\/logs_viewer_no_wrap.png\"},\
    {\"alt\": \"tooltip tab\", \"url\": \"https:\/\/raw.githubusercontent.com\/maltus\/docker-logs-viewer\/refs\/heads\/main\/docs\/logs_viewer_tooltip_tab.png\"}]" \
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/maltus/docker-logs-viewer/refs/heads/main/docker.svg" \
    com.docker.extension.detailed-description="\
    Docker extension for monitoring containers' logs with comfortable user-friendly UI/UX to troubleshoot faster.<br><br>\
    <b>Key features:</b><br><br>\
    - Collect logs in real-time<br>\
    - Search logs<br>\
    - Compact logs view: similar to CLI output<br>\
    - Isolated tabs per container<br>\
    - Scrollable tabs horizontally<br>\
    - All logs separated tab<br>\
    - Show container status<br>\
    - Optimized rendering for big amount of logs<br>\
    - Own settings per container:<br>\
    &nbsp;&nbsp;&nbsp;&nbsp; wrap/unwrap log lines<br>\
    &nbsp;&nbsp;&nbsp;&nbsp; show/hide sys timestamp<br>\
    &nbsp;&nbsp;&nbsp;&nbsp; show/hide stdout<br>\
    &nbsp;&nbsp;&nbsp;&nbsp; show/hide stderr<br>\
    &nbsp;&nbsp;&nbsp;&nbsp; follow/unfollow output<br>\
    - Expand/collapse row: render pretty formatted JSON log message\
    " \
    com.docker.extension.publisher-url="https://github.com/maltus/docker-logs-viewer" \
    com.docker.extension.additional-urls="[{\"title\":\"Project GitHub\",\"url\":\"https:\/\/github.com\/maltus\/docker-logs-viewer\"}]" \
    com.docker.extension.categories="utility-tools" \
    com.docker.extension.changelog="\
     &nbsp;&nbsp;- added search logs<br>\
     &nbsp;&nbsp;- added wrap lines option<br>\
     &nbsp;&nbsp;- improveD look and feel<br>\
    <br>\
    <b>v0.0.1:</b><br>\
     &nbsp;&nbsp;- init version release"

COPY docker-compose.yaml .
COPY metadata.json .
COPY docker.svg .
COPY --from=client-builder /ui/build ui
