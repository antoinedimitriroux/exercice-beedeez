const fs = require('fs');
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const http = require("http");
const port = 3000;


var jsonData = null;
var words = [];
var dictionnaire = [];
dictionnaire[""] = [];

const file = fs.createWriteStream("data.txt");

function readData(){
  console.log("Attempting to connect to Beedeez and getting Database");
  http.get("http://api.beedeez.com/api/v1/public/lessons/200/1", response => {
    console.log("Connection OK");
    var stream = response.pipe(file);
      stream.on("finish", function() {
      console.log("Database received");
      fs.readFile('data.txt', function(err, data) {
        console.log("Parsing JSON Database");
        jsonData = JSON.parse(data);
        var separators = ['\\\,','\\\.',' ', '\\\+', '-', '\\\(', '\\\)', '\\*', '/', ':', '\\\?'];
        var regexp = new RegExp(separators.join('|'), 'g');
        for (var i = 0; i < jsonData.results.length; i++){
          var capsule = jsonData.results[i];
          //console.log(capsule.title);
          dictionnaire[""].push(i);
          for (var propriete in capsule) {
            var content = capsule[propriete] + "";
            var splitContent = content.split(regexp);
            for (var j = 0; j < splitContent.length; j++){
              var word = splitContent[j].toLowerCase();
              if (word.length > 3){
                words.push(word);
                for (var z = 0; z < word.length - 1; z++){
                  var subWord = word.substring(0,word.length-z);
                  if (!dictionnaire[subWord] || dictionnaire[subWord]== null){
                    dictionnaire[subWord] = [];
                  }
                  if (dictionnaire[subWord].length == 0 || (dictionnaire[subWord].length != 0 && dictionnaire[dictionnaire[subWord].length-1] != i)){
                    if (dictionnaire[subWord].push){
                      dictionnaire[subWord].push(i);
                    }
                  }
                }
              }
            }
          }
        }
        console.log("Job done on Database!");
        //console.log(jsonData);
      });
    });
  });
}


io.on("connection", socket => {

  console.log("New connection");

  socket.on('question',  function (message) {

    var messageText = message.text;
    console.log("New question: " + messageText);
    var messageOptions = message.options;

    var filtreLangues = messageOptions.filtreLangues;

    var messageNormalise = messageText.toLowerCase() + "";

    var meilleureSuggestion = "";
    for (var i = 0; i < words.length; i++){
      var word = words[i];
      if (word.indexOf(messageNormalise) >= 0 && word.length > meilleureSuggestion.length){
        meilleureSuggestion = word;
      }
    }
    if (meilleureSuggestion.length > messageNormalise.length){
      socket.emit('suggestion', meilleureSuggestion ) ;
    }
    else{
      socket.emit('suggestion', "") ;
    }

    var reponse = "";

    if (dictionnaire[messageNormalise] && dictionnaire[messageNormalise].length > 0){

      console.log("res: " + dictionnaire[messageNormalise]);

      for (var i = 0; i < dictionnaire[messageNormalise].length; i++){

        var indexCapsule = dictionnaire[messageNormalise][i];

        if (filtreLangues != null && filtreLangues.length > 0 && jsonData.results[indexCapsule].lang != filtreLangues){
          continue;
        }

        var capsuleText = 
        "Titre: " + 
        jsonData.results[indexCapsule].title + "\n" + 
        "----------------------------"+ "\nRésumé: " + 
        jsonData.results[indexCapsule].summary + "\n" + 
        "----------------------------"+ "\nNiveau: " + 
        jsonData.results[indexCapsule].level + "\n" + 
        "----------------------------"+ "\nLangue: " + 
        jsonData.results[indexCapsule].lang + "\n" +
        "----------------------------"+ "\nDate: " + 
        jsonData.results[indexCapsule].lastUpdate + "\n";

        if (messageNormalise.length > 0){
          capsuleText = capsuleText.replace(
            messageNormalise,
            messageNormalise.toUpperCase()
          );
        }

        reponse += capsuleText;
        reponse += "@";
      }

    }
    
    if (reponse.length > 0){      
      //console.log(reponse);
      socket.emit('response', reponse ) ;
    }
    
  });

});


readData();
server.listen(8080,'0.0.0.0');
