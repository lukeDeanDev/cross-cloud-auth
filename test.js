const assert = require('assert').strict;
const axios = require('axios');
const querystring = require('querystring');
const { app1, app2, useV2Tokens } = require('./config');

const getToken = async ({
  cloud, appId, secret, scope,
}) => {
  const url = useV2Tokens
    ? `https://login.microsoftonline.${cloud}/common/oauth2/v2.0/token`
    : `https://login.microsoftonline.${cloud}/common/oauth2/token`;
  try {
    const response = await axios.post(
      url,
      querystring.stringify({
        grant_type: 'client_credentials',
        scope,
        client_id: appId,
        client_secret: secret,
      }),
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      },
    );
    const token = response.data.access_token;
    // Decode and log the claims
    const [header, claims, signature] = token.split('.'); // eslint-disable-line no-unused-vars
    console.log(JSON.parse(Buffer.from(claims, 'base64').toString()));
    // return the full token
    return token;
  } catch (err) {
    console.log(err.response.data);
    throw err;
  }
};

const request = async (url, token) => {
  try {
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.log(JSON.stringify(err, null, 2));
    console.log(err.response.data);
    throw err;
  }
};

describe('apps talking to apps', () => {
  it('app1 should be able to talk to app1', async () => {
    const scope = `${app1.appUrl}/.default`;
    const token = await getToken({ ...app1, scope });
    const result = await request('http://localhost:8080/app1', token);
    assert(result);
  });
  it('app2 should be able to talk to app2', async () => {
    const scope = `${app2.appUrl}/.default`;
    const token = await getToken({ ...app2, scope });
    const result = request('http://localhost:8080/app2', token);
    assert(result);
  });
  it('app1 should be able to talk to app2', async () => {
    const scope = `${app2.appUrl}/.default`;
    const token = await getToken({ ...app1, scope });
    const result = request('http://localhost:8080/app2', token);
    assert(result);
  });
  it('app2 should be able to talk to app1', async () => {
    const scope = `${app1.appUrl}/.default`;
    const token = await getToken({ ...app2, scope });
    const result = request('http://localhost:8080/app1', token);
    assert(result);
  });
});
