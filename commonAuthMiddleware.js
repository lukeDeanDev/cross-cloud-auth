const passport = require('passport');
const { BearerStrategy } = require('passport-azure-ad');

module.exports = ({
  cloud, appId, validIssuers, useV2Tokens,
}) => {
  const strategyName = `${appId}Strategy`; // When you register multiple strageties in the same app, they must be named.
  passport.use(
    strategyName,
    new BearerStrategy(
      {
        identityMetadata: useV2Tokens
          ? `https://login.microsoftonline.${cloud}/common/v2.0/.well-known/openid-configuration`
          : `https://login.microsoftonline.${cloud}/common/.well-known/openid-configuration`,
        clientID: appId,
        issuer: validIssuers,
        loggingLevel: 'warn',
        loggingNoPII: false,
      },
      (token, done) => {
        console.log(token); // Log the decoded token.
        const { sub } = token;
        done(null, sub); // done is the custom callback on passport.authenticate
      },
    ),
  );
  return (req, res, next) => {
    const customCallback = (err, user, info) => {
      console.log('ERR IS ', err);
      console.log('USER IS ', user);
      console.log('INFO IS ', info);
      if (err) {
        next(err);
        return;
      }
      if (!user) {
        next(new Error(info));
        return;
      }
      req.userName = user;
      next();
    };
    passport.authenticate(strategyName, { session: false }, customCallback)(req, res, next);
  };
};
