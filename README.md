[![GitHub issues](https://img.shields.io/github/issues/entmike/hana-cockpit.svg)](https://github.com/entmike/hana-cockpit/issues)
[![Docker Pulls](https://img.shields.io/docker/pulls/entmike/hana-cockpit.svg)](https://hub.docker.com/r/entmike/hana-cockpit/)
[![Automated Build](https://img.shields.io/docker/cloud/automated/entmike/hana-cockpit.svg)](https://hub.docker.com/r/entmike/hana-cockpit/)

# hana-cockpit
HANA Cockpit is a collection of utilities to perform common tasks when playing in HANA.  These same tasks can be accomplished in `hdbsql` or **HANA Studio** via SQL, however in cases where neither client tool is readily available, or you do not wish to install or use these tools, this is a lightweight alternative.

# Usage Examples
## Minimal Example
```bash
docker run --rm -p 8080:80 -e BACKEND_PASSWORD=MYSECRETPASSWORD entmike/hana-cockpit
```
Note: `BACKEND_PASSWORD` is not your HANA DB password.  This is a password that you will have to provide when saving your application preferences, and potentially other future functions.