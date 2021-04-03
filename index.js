const NaturalLanguageUnderstandingV1 = require("ibm-watson/natural-language-understanding/v1")
const { IamAuthenticator } = require("ibm-watson/auth")
const CRED = require('./ibmCRED.json')
const express = require("express")
var admin = require("firebase-admin");

var app = express()

// Fetch the service account key JSON file contents
var serviceAccount = require("./dystic-test-firebase-adminsdk-bz1tw-6f17bd8624.json");
const e = require("express");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dystic-test-default-rtdb.firebaseio.com"
});


const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: '2020-08-01',
  authenticator: new IamAuthenticator({
    apikey: CRED.apikey,
  }),
  serviceUrl: CRED.url,
});

app.use("/analyze/:id", (req, res) => {
  var db = admin.database();
  const ResumeID = req.params.id
  var ref = db.ref("resumes/" + ResumeID);
  ref.once("value", function (snapshot) {
    if (snapshot.val() != null) {
      resumeSummary = snapshot.val().objective.body
      const analyzeParams = {
        "text": resumeSummary,
        'features': {
          'emotion': {},
          'concepts': {},
        },
      };
      naturalLanguageUnderstanding.analyze(analyzeParams)
        .then(analysisResults => {
          // console.log(JSON.stringify(analysisResults, null, 2));
          res.status(200).json(analysisResults["result"])

        })
        .catch(err => {
          console.log('error:', err);
          res.status(500).json({ "error": err })
        });
    } else {
      res.status(400).json({ "error": "resume not found" })
    }
  });

});


const PORT = process.env.PORT || 7000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))