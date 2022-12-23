import axios from 'axios';
import { writeFileSync } from 'fs';

const baseURL = process.env.BASEURL;
const versionId = process.env.VERSIONID;
const accessToken = process.env.ACCESSTOKEN;
const request = axios.create({
  baseURL,
  headers: { Authorization: `Bearer ${accessToken}` },
});

/**
 * Fetches every object from the Dictionary module and writes the result to a `dictionary.json` file.
 */
async function exportDictionary() {
  /** Fetch the list of sources objects and their children */
  const sources = await fetchObjects({ dataType: 'sources' });

  /** Once every object has been fetched, write them to a `dictionary.json` file */
  writeFileSync('dictionary.json', JSON.stringify(sources, null, '\t'));
}

/**
 * Sends a `GET` request to the `/{dataType}` endpoint in order to fetch up to 5000 objects of the given `dataType`.\
 * The function calls itself until all objects have been fetched.
 *
 * @param config This config object contains the following :
 * - `dataType` : type of objects to fetch (e.g.: `sources`, `containers`, `structures`, `fields`)
 * - `parentId` : determines from which parent the objects should be fetched
 * - `page` : Used as `page` parameter for the request. Required in order to iterate through pagination
 * - `result` : Contains the cumulative list of fetched objects
 * @returns Calls itself again if more objects exists or returns the list of fetched objects
 */
async function fetchObjects({ dataType, parentId, page = 1, result = [] }) {
  /** Make a request to GET /{dataType} endpoint in order to fetch a list objects */
  const { data } = await request(
    `/${dataType}?versionId=${versionId}&page=${page}&limit=5000&parentId=${parentId}&maxDepth=0`
  );

  /** Store fetched objects */
  result = [...result, ...data.results];

  /** Fetch every source or container object's children recursively */
  if (dataType == 'sources' || dataType == 'containers') {
    await fetchChildren(result, 'containers', 'structures');
  }

  /** Fetch every structure object's children recursively */
  if (dataType == 'structures') {
    await fetchChildren(result, 'fields', 'structures');
  }

  /** If there is more to fetch, calls itself to fetch next page. Else, return complete object list */
  return data.next_page
    ? fetchObjects({ dataType, parentId, page: page + 1, result })
    : result;
}

/**
 * This function receives a list of parent objects, fetches their children recursively and returns
 * the list of parent objects with their children.
 *
 * @param parents List of parent objects
 * @param childDataType1 First type of children objects to fetch
 * @param childDataType2 Second type of children objects to fetch
 * @returns List of parent objects with their children
 */
async function fetchChildren(parents, childDataType1, childDataType2) {
  for (let parent of parents) {
    const children1 = await fetchObjects({
      dataType: childDataType1,
      parentId: parent.id,
    });
    const children2 = await fetchObjects({
      dataType: childDataType2,
      parentId: parent.id,
    });

    parent.children = [...children1, ...children2];
  }

  return parents;
}

exportDictionary();
