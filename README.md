# Dictionary Module export script

## Overview

This script fetches every object of your Dictionary module and stores them in a `dictionary.json` file.

## Getting started

### 1. Installing dependencies

Run the following command in order to install the script's dependencies :

```bash
npm install
```

### 2. Editing the script's configuration

Open the `.env` file and update its configuration variables:

- `BASEURL` : your DataGalaxy API base url; should look like this `https://foo.api.datagalaxy.com/v2`
- `VERSIONID` : required in order for the script to target the correct workspace's version
- `ACCESSTOKEN` : authenticate the script's requests, can be found in the Integration section of your Admin page in the DataGalaxy web application

### 3. Running the script

Run the following command :

```bash
npm start
```

### 4. Result

The exported objects can be found in the `dictionary.json` file.
