'use strict';

/**
 * Dependencies
 */
const parseConfig = require('./helpers/parse-config');
const getPathsSync = require('./helpers/get-paths-sync');
const getPathsAsync = require('./helpers/get-paths-async');
const replaceSync = require('./helpers/replace-sync');
const replaceAsync = require('./helpers/replace-async');

/**
 * Replace in file helper
 */
function replaceInFile(config, cb) {

  //Parse config
  try {
    config = parseConfig(config);
  }
  catch (error) {
    if (typeof cb === 'function') {
      return cb(error, null);
    }
    return Promise.reject(error);
  }

  //Get config
  const {files, from, to, dry, verbose} = config;

  //Find paths
  return getPathsAsync(files, config)

    //Make replacements
    .then(paths => Promise.all(
      paths.map(file => replaceAsync(file, from, to, config))
    ))

    //Success handler
    .then(results => {
      if (typeof cb === 'function') {
        cb(null, results);
      }
      return results;
    })

    //Error handler
    .catch(error => {
      if (typeof cb === 'function') {
        cb(error);
      }
      else {
        throw error;
      }
    });
}

/**
 * Sync API
 */
function replaceInFileSync(config) {

  //Parse config
  config = parseConfig(config);

  //Get config, paths, and initialize changed files
  const {files, from, to, dry, verbose} = config;
  const paths = getPathsSync(files, config);

  //Process synchronously and return results
  return paths.map(path => replaceSync(path, from, to, config));
}

// Self-reference to support named import
replaceInFile.replaceInFile = replaceInFile;
replaceInFile.replaceInFileSync = replaceInFileSync;
replaceInFile.sync = replaceInFileSync;

//Export
module.exports = replaceInFile;
