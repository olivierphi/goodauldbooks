/**
 * Ugly hard-coded params?
 * Yup, but we can adapt any of these parameters for staging/prod environments,
 * just by running a few "sed -i" on the bundled-by-Webpack JS files :-)
 * (or before running WebPack during the deployment process, and running "sed -i" only on this file. Whatever...)
 *
 * @see the "bin/netlify_build_client.sh" script, where we actually do those "sed -i" during the deployment to Netlify
 */

export const AppConfig = {
  apiBaseURL: "http://localhost:8080/graphql",
  coversBaseURL: "http://localhost:8080/library/cover",
};
