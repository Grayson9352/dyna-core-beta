const crypto = require("crypto");
const fs = require("fs");
const Profile = require("../lib/profile");

module.exports = (app) => {
  //exchange (egl2)
  app.get("/account/api/oauth/exchange", function (req, res) {
    res.json({
      expiresInSeconds: 99999,
      code: crypto.randomBytes(15).toString("hex"),
      creatingClientId: "61d2f70175e84a6bba80a5089e597e1c",
    });
  });

  //token
  app.post("/account/api/oauth/token", (req, res) => {
    userName = "";
    accId = "";
    if (req.body.username) userName = req.body.username.split("@")[0];
    else if (req.body.email) userName = req.body.email.split("@")[0];
    else displayName = `InvalidUser${Math.random().toString().substring(15)}`;
    accountId = displayName.replace(/ /g, "_");
    if (!accountId.startsWith("InvalidUser")) {
      var profileId = "athena";
      var profileData = Profile.readProfile(accountId, profileId);
      if (!profileData) {
        profileData = Profile.readProfileTemplate(profileId);
        if (!profileData) {
          throw new ApiException(
            errors.com.epicgames.modules.profiles.operation_forbidden
          ).with(profileId);
        }
        profileData.created = profileData.updated = new Date().toISOString();
        profileData["_id"] = accountId;
        profileData.accountId = accountId;
        //await Profile.updatedCos(profileData);
        try {
          fs.mkdirSync(`./home/${accountId}/profile`, { recursive: true });
          Profile.saveProfile(accountId, profileId, profileData);
        } catch (e) {
          console.log("Failed creating profile!");
          throw e;
        }
      }
    }

    // Invalid User
    else userName = "BlazeUser";
    res.json({
      access_token: crypto.randomBytes(15).toString("hex"),
      expires_in: 1000000000,
      expires_at: "9999-12-31T23:59:59.999Z",
      token_type: "bearer",
      account_id: userName, //amazing id
      client_id: "ec684b8c687f479fadea3cb2ad83f5c6",
      internal_client: true,
      displayName: userName,
      app: "fortnite",
      in_app_id: userName, //amazing id
      device_id: "5dcab5dbe86a7344b061ba57cdb33c4f",
    });
  });
  //verification
  app.get("/account/api/oauth/verify", (req, res) => {
    res.json({
      access_token: req.headers.authorization,
      expires_in: 28800,
      expires_at: "9999-12-31T23:59:59.999Z",
      token_type: "bearer",
      refresh_token: "cd581d37b0434726a37b0268bb99206c",
      refresh_expires: 115200,
      refresh_expires_at: "9999-12-31T23:59:59.999Z",
      account_id: "default",
      client_id: "3446cd72694c4a4485d81b77adbb2141",
      internal_client: true,
      client_service: "fortnite",
      displayName: req.h,
      app: "fortnite",
      in_app_id: "default",
      device_id: "164fb25bb44e42c5a027977d0d5da800",
    });
  });
  //sign out
  app.delete("/account/api/oauth/sessions/kill", (req, res) => {
    res.status(204).end();
  });
  app.delete("/account/api/oauth/sessions/kill/:token", (req, res) => {
    delete global[req.params.token];
    res.status(204).end();
  });
  //account info
  app.get("/account/api/public/account/:accountId", (req, res) => {
    var displayname = `${req.params.accountId}`;
    if (displayname.endsWith("="))
      displayname = Buffer.from(req.params.accountId, "base64").toString();
    res.json({
      id: req.params.accountId,
      displayName: displayname,
      externalAuths: {},
    });
  });
  app.get("/account/api/public/account/", (req, res) => {
    res.json([
      {
        id: req.query.accountId,
        displayName: req.query.accountId,
        externalAuths: {},
      },
    ]);
  });
  // device auth
  app.get("/account/api/public/account/:accountId/deviceAuth", (req, res) =>
    res.json([])
  );
  app.post("/account/api/public/account/:accountId/deviceAuth", (req, res) =>
    res.json({
      accountId: req.params.accountId,
      deviceId: "aabbccddeeff11223344556677889900",
      secret: "aabbccddeeff11223344556677889900",
    })
  );
};
