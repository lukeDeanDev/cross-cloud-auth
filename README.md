# cross-cloud-auth

This is a minimal testing environment for experimenting with cross-cloud AAD authentication with simple client_credentials grants.

Right now, it doesn't seem to be possible, but this demonstrates that.

## Setup

You need to populate your own `/config.js`

### For app1 and app2...

Create an AAD Application Registration. Make sure to pick the option for **Multi-Tenant**! Note the AppId.

Create an "Application ID URI".
The default "app://{appId}" one is not good enough for use with the `/common` OAuth endpoints! See https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-convert-app-to-be-multi-tenant#update-registration-to-be-multi-tenant  
It must be of the form `https://SomeWebDomainAssociatedWithYourTenant/YourUniqueAppName`. If the domain isn't associated with your tenant, Azure won't let you use it. If the whole thing isn't globally unique, it won't work.  
This is only necessary for using the `/common` OAuth endpoints. The `/common` OAuth token endpoints only seem to work when you follow these rules and when you specify _appUrl/.default_ as the _scope_ on the token request. The `/common` endpoint seems to need this domain name to find the server's application registration.

In your Application Registration's manifest, change `accessTokenAcceptedVersion` from `null` to `2`. This value on the server's application registration is what determines which version of Azure token you'll get. I've had bad luck with version 1 tokens in multi-tenant scenarios, and since version 2 is officially the only version supported for B2C integrations (and because version 2 is closer to everybody else's standards), I recommend v2. If you want to play around with v1, set `useV2Tokens` to `false` in the config file.

Create a secret on the application registration and make note of it.

This process should be enough to fill out the `config.js` file.

## Run it

`npm install`

`npm run start` to start the local expressJS server on http://localhost:8080

In another window, `npm run test` to make calls against this server.

You'll see some console logs in both the server and the test window. You'll see the decoded JWT claims for an easier view into what's going on. You'll see detailed error messages from the server responses.

## Successes

Token-fetching and request authorization is working with the `/common` endpoint. The `/common` endpoint seems to be capable of cross-tenant auth, but maybe not cross-cloud auth...

## invalid_request failures

When a commercial application tries to get a token scoped for a usgov application, it fails with

```
AADSTS900382: Confidential Client is not supported in Cross Cloud request.
```

When a usgov applicaiton tries to get a token scoped for a commercial application, it fails with

```
AADSTS90038: Tenant 'my_commercial_domain' request is being redirected to the National Cloud 'MicrosoftOnline.COM'.
```
