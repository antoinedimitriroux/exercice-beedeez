import React, { useRef, useEffect, PureComponent, Component, useState } from 'react';
import { Animated, FlatList, SafeAreaView, TextInput, Keyboard, Dimensions, Slider, Picker, TouchableHighlight, StatusBar, Switch, ScrollView, Text, View, StyleSheet, TouchableOpacity, Button, Image } from 'react-native';
import Constants from 'expo';
import {AsyncStorage} from "react-native";
import RadioForm from 'react-native-simple-radio-button';
import Highlighter from 'react-native-highlight-words';
import VerticalSlider from 'rn-vertical-slider';
import DatePicker from 'react-native-datepicker';
import { BlurView } from 'expo-blur';


//TOUTES LES VARIABLES DONT ON A BESOIN POUR L'APPLICATION
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
var radioButtonProperties = [
  { value: 0 },
  { value: 1 },
  { value: 2 }
];

//CAPSULES EST UN TABLEAU QUI VA CONTENIR TOUTES LES CAPSULES SOUS FORME D'OBJETS
var capsules = null;

//WORDS EST UN TABLEAU QUI VA CONTENIR TOUS LES MOTS DES CAPSULES
//ON EN A BESOIN POUR FAIRE DES SUGGESTIONS QUAND L'UTILISATEUR EFFECTUE UNE REQUETE
var words = null;

//DICTIONNAIRE EST UNE HASHAMAP STRING => [INT], QUI PREND EN ENTREE UN MOT,
//ET RETOURNE LES INDICES DES CAPSULES CONTENANT CE MOT, OU NULL SI AUCUNE CAPSULE NE CONTIENT LE MOT
var dictionnaire = null;

function toString(e) {
  var propValue;
  for (var propName in e) {
    propValue = e[propName]
    console.log(propName, propValue);
  }
}

export default class App extends Component {

  constructor() {

    super();

    this.state = {

      value: 0,

      description: '',

      data: [],

      placeholder: 'Chercher une capsule...',

      filtreLangues: '',

      request: '',

      lastSuggestions: [],

      leftMenuOnOff: false,

      leftMenuPosition: -screenWidth * 1.,

      backgroundColor: "#0062B1",

      fontColor: "#FCC400",

      fontFamily: "Arial",

      fontSize: 18

    };
  }


  //FONCTION APPELEE DES QUE TOUT EST PRET
  componentDidMount(){
    this.tryToGetDataFromLocal();
  }


  tryToGetDataFromLocal = async () => {
    //ON ESSAIE DE RECUPERER LES DONNEES EN LOCAL
    try {
      capsules = JSON.parse(await AsyncStorage.getItem("capsules"));
      if (capsules == null){
        throw 'Bad: capsules not in local';
      }
      else{
        console.log("Good: capsules found in local");
      }
      dictionnaire = JSON.parse(await AsyncStorage.getItem("dictionnaire"));
      if (dictionnaire == null){
        throw 'Bad: dictionnaire not in local';
      }
      else{
        console.log("Good: dictionnaire found in local");
      }
      words = JSON.parse(await AsyncStorage.getItem("words")); 
      if (words == null){
        throw 'Bad: words not in local!';
      }
      else{
        console.log("Good: words found in local");
      }
    } catch (error) {
      //UN DES OBJETS NECESSAIRES A L'APPLI N'A PAS ETE TROUVE EN LOCAL
      //ON DOIT TELECHARGER LE FICHIER JSON CONTENANT LES DONNES, LE TRAVAILLER ET L'ENREGISTRER POUR LA PREMIERE FOIS
      this.tryToGetDataFromInternetAndThenProcess();
      return error;
    }
  }



  //FONCTION QUI PERMET D'ENREGISTRER DES DONNES EN LOCAL
  _storeData = async (key,data) => {
    try {
        await AsyncStorage.setItem(key,data);
    } catch (error) {
        console.log("Bad: " + key);
        return error;
    }
  }
  //FONCTION QUI VA RECUPERER LE FICHIER DATA SUR LE SITE API DE BEEDEEZ
  //PUIS TRAITE CES DONNEES ET ENFIN LES ENREGISTRE EN LOCAL POUR PLUS TARD
  tryToGetDataFromInternetAndThenProcess = () => {
    console.log("capsules, dictionnaire et words pas disponibles en local");

    capsules = [];
    words = [];
    dictionnaire = {};
    dictionnaire[""] = [];

    //ON RECUPERE LE FICHIER TEXT/PLAIN QUI CONTIENT LES DONNESS
    fetch('https://api.beedeez.com/api/v1/public/lessons/200/1', {
       method: 'GET'
    })
    //ON A RECU LE FICHIER
    .then((response) => response.json())
    //ON PARSE LE FICHIER JSON POUR OBTENIR UN OBJ
    .then((responseJson) => {
      //ON CREE UN REGEXP POUR SPLIT LES STRINGS EN MOTS
      var separators = ["l'",'\\\,','\\\.',' ', '\\\+', '-', '\\\(', '\\\)', '\\*', '/', ':', '\\\?', '\\\[', '\\\]'];
      var regexp = new RegExp(separators.join('|'), 'g');

      //POUR CHAQUE CAPSULE
      for (var i = 0; i < responseJson.results.length; i++){
        var capsule = responseJson.results[i];
        capsules.push(capsule);

        //ON AJOUTE LA CAPSULE DANS LE DICTIONNAIRE POUR LE MOT VIDE, POUR QUE LES REQUETES VIDES RENVOIENT TOUTES LES CAPSULES
        dictionnaire[""].push(i);

        //ON PARCOURT TOUTES LES PROPRIETES DE LA CAPSULE (TITRE, SUMMARY, ETC...)
        for (var propriete in capsule) {
          var content = capsule[propriete] + "";

          //ON SPLIT LE CONTENU DE CHAQUE PROPRIETE POUR OBTENIR LES MOTS SEPARES
          var splitContent = content.split(regexp);
          for (var j = 0; j < splitContent.length; j++){

            //POUR CHAQUE MOT, ON LE PASSE EN MINISCULE
            var word = splitContent[j].toLowerCase();
            word = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            //SI LE MOT EST ASSEZ LONG, ON AJOUTE DANS LA CASE DU DICTIONNAIRE L'INDICE DE LA CAPSULE CONTENANT CE MOT
            if (word.length >= 2 && word.length < 24){
              words.push(word);
              for (var z = 0; z < word.length - 1; z++){
                var subWord = word.substring(0,word.length-z);
                if (!dictionnaire[subWord] || dictionnaire[subWord]== null){
                  dictionnaire[subWord] = [];
                }
                if (dictionnaire[subWord].length == 0 || (dictionnaire[subWord].length != 0 && dictionnaire[dictionnaire[subWord].length-1] != i)){
                  //J'AJOUTE CE TEST PARCE QUE J'AI UN BUG QUE JE N'ARRIVE PAS A RESOUDRE
                  if (dictionnaire[subWord].push){
                    dictionnaire[subWord].push(i);
                  }
                }
              }
            }
          }
        }
      }

      //ON TRIE LES MOTS
      words.sort();
      //ET ON S'ASSURE QUE CHAQUE MOT EST UNIQUE
      for (var i = 0; i < words.length - 1; i++){
        if (words[i] == words[i+1]){
          words.splice(i,1);
          i--;
        }
      }

      //POUR CHAQUE CASE DU DICTIONNAIRE, ON SUPPRIME LES DOUBLONS (LES INDICES SONT TRIES)
      for (var i = 0; i < words.length; i++){
        var word = words[i];
        var indicesCapsules = dictionnaire[word];
        for (var j = 0; j < indicesCapsules.length - 1; j++){
          if (indicesCapsules[j] == indicesCapsules[j+1]){
            indicesCapsules.splice(j,1);
            j--;
          }
        }
      }

      console.log("J'enregistre capsules, dictionnaire et words en local...");

      this._storeData('capsules',JSON.stringify(capsules));
      this._storeData('dictionnaire',JSON.stringify(dictionnaire));
      this._storeData('words',JSON.stringify(words));

    })
    .catch((error) => {
       console.log("Vous n'avez pas de données en local, et vous n'êtes pas connecté à internet...");
        console.log(error);
    });    
  }




  //LA FONCTION QU'ON APPELLE POUR OBTENIR LES CAPSULES
  //ELLE EST APPELEE LORSQU'ON MODIFIE LE TEXTINPUT OU LORSQU'ON MODIFIE LE FILTRE DE LANGUE
  askQuestion = (question) => {

    console.log("je pose la question: " + question);

    //ON NORMALISE LA QUESTION, EN LA PASSANT EN MINUSCULE ET EN ENLEVANT LES ACCENTS ETC...
    var questionPropre = question.toLowerCase();
    questionPropre = questionPropre.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    //ON DEFINIT LA LANGUE DESIREE EN FONCTION DE LA VALEUR DE NOTRE RADIOBUTTON
    var langueDesiree = null;
    if (this.state.filtreLangues == 0){
      langueDesiree = 'all';
    }
    if (this.state.filtreLangues == 1){
      langueDesiree = 'fr';
    }
    if (this.state.filtreLangues == 2){
      langueDesiree = 'en';
    }

    //ON VA CHERCHER DANS LE DICTIONNAIRE LES INDICES DES CAPSULES CONTENANT NOTRE QUESTION
    var indicesCapsules = dictionnaire[questionPropre];

    //SI ON A TROUVE DES INDICES DE CAPSULES
    if (indicesCapsules != null){
      
      //ON CREE UN TABLEAU QUI VA CONTENIR NOS CAPSULES SOUS FORME D'OBJETS
      var newData = []; 
      var hashmapIndicesDejaAjoutes = [];

      for (var i = 0; i < indicesCapsules.length; i++){

        var indice = indicesCapsules[i];
        var capsule = capsules[indice];
        var langueCapsule = capsule.lang;

        //ON CHECKE SI LA LANGUE CORRESPOND
        if ( langueDesiree == "all" || (langueDesiree == langueCapsule) ){

          //ON EFFECTUE CE TEST POUR NE PAS AJOUTER DEUX FOIS LA MEME CAPSULE
          if (hashmapIndicesDejaAjoutes[indice] == null){
            hashmapIndicesDejaAjoutes[indice] = indice;

            //ON CREE NOTRE CAPSULE
            var capsuleObj = 
            {
              title: capsule.title,
              summary: capsule.summary,
              level: capsule.level,
              lang: capsule.lang,
              lastUpdate: capsule.lastUpdate,
              images: capsule.images
            }

            //ON L'AJOUTE A NOS NOUVELLES DATA
            newData.push({ id : parseInt(Math.random()*10000000), caps : capsuleObj});
          }
        }

      }

      //SI LA QUESTION EST NON-VIDE
      if (questionPropre.length > 0){

        //ON CHERCHE PARMI TOUS LES MOTS CEUX QUI CONTIENNENT LA QUESTION
        var suggestions = [];
        for (var i = 0; i < words.length; i++){
          var word = words[i];
          var indexOf = word.indexOf(questionPropre);
          if (indexOf >= 0){
            suggestions.push({text:word, count:dictionnaire[word].length, indexOf});
          }
        }

        //HEURISTIQUE MAISON
        //ON TRIE LES SUGGESTIONS EN FONCTION DE LEUR TAILLE, DE LEURS OCCURENCES ET DE LA POSITION DE LA QUESTION DANS LA SUGGESTION 
        suggestions.sort(function(a,b){return (Math.min(5,b.text.length)*b.count*(30+a.indexOf)-Math.min(5,a.text.length)*a.count*(30+b.indexOf)) });

        //ON CHANGE L'ETAT DE NOS DONNEES AVEC LES NOUVELLES CAPSULES, LA NOUVELLE QUESTION, LES NOUVELLES SUGGESTIONS, ET LE NOMBRE DE REPONSES
        this.setState(
          {
            data: newData,
            description: newData.length + " resultats",
            request: questionPropre,
            lastSuggestions: suggestions
          }
        );

      } 

      //CAS PARTICULIER: ON A UNE QUESTION VIDE, ON A RECUPERE TOUTES LES CELLULES
      else{

        //ON CHANGE L'ETAT DE NOS DONNEES AVEC LES NOUVELLES CAPSULES, LA NOUVELLE QUESTION, LES NOUVELLES SUGGESTIONS, ET LE NOMBRE DE REPONSES
        this.setState(
          {
            data: newData,
            description: newData.length + " resultats",
            request: "",
            lastSuggestions: []
          }
        );  
      } 
    }

  }

  toggleLeftMenu = () => {
    var newLeftMenuOnOff = !this.state.leftMenuOnOff;
    this.setState({leftMenuOnOff: newLeftMenuOnOff});
    if (this.state.leftMenuOnOff){      
      this.setState({leftMenuPosition: 0});
    }
    else{
      this.setState({leftMenuPosition: -screenWidth});
    }
  }


  leftMenuWrapperStyles = function(options) {
    return {
      position:'absolute',
      width: screenWidth,
      height: screenHeight,
      top:0,
      backgroundColor: "transparent",
      zIndex:3,
      left: this.state.leftMenuPosition
    }
  }

  handleBackgroundColorChange = (color) => {
    this.setState({ backgroundColor: color.hex });
  };
  handleFontColorChange = (color) => {
    this.setState({ fontColor: color.hex });
  };

  //FONCTION DE RENDU GRAPHIQUE
  render() {


    return (

      <ScrollView style={[styles.mainContainer, {backgroundColor: this.state.backgroundColor}]}>


        <TouchableOpacity
          style={styles.burger}
          onPress = {() => {this.toggleLeftMenu();}}>
          <Image
            style={styles.miniLogo}
            source={require("./assets/images/logo-Beedeez.png")}>
          </Image> 
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addCapsule}
          onPress = {() => {}}>
          <Image
            style={styles.miniLogo}
            source={require("./assets/images/plus-flat.png")}>
          </Image> 
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.heart}
          onPress = {() => {}}>
          <Image
            style={styles.miniLogo}
            source={require("./assets/images/heart.webp")}>
          </Image> 
        </TouchableOpacity>        

        <View
          style={this.leftMenuWrapperStyles()}>

          <ScrollView
            style={[styles.leftMenuInside, {backgroundColor:this.state.backgroundColor, color:this.state.fontColor, fontSize:this.state.fontSize, borderColor:this.state.fontColor, fontSize:this.state.fontSize}]}
            showsHorizontalScrollIndicator={false}>

            <View style={[styles.subMenu, {backgroundColor:this.state.backgroundColor, color:this.state.fontColor, fontSize:this.state.fontSize, borderColor:this.state.fontColor, fontSize:this.state.fontSize, borderTopWidth: 30}]}>
              <Text style={[styles.subMenuTitle,{color:this.state.backgroundColor, fontFamily:this.state.fontFamily}]}>{"Compte"}</Text>
              
              <View style={[styles.submenuItem,{color:this.state.backgroundColor, borderColor:this.state.fontColor, fontSize:this.state.fontSize, fontFamily:this.state.fontFamily}]}>
                <Text style={[styles.optionsDescription,{fontFamily:this.state.fontFamily, color:this.state.fontColor}]}> Pseudo </Text>
                <TextInput
                  style={[styles.optionsDescription,{fontFamily:this.state.fontFamily, color:this.state.fontColor, textAlign: "center"}]}
                  placeholderTextColor = {this.state.fontColor}
                  placeholder={"Pseudo"}
                ></TextInput>
              </View>

              <View style={[styles.submenuItem,{color:this.state.backgroundColor, borderColor:this.state.fontColor, fontSize:this.state.fontSize, fontFamily:this.state.fontFamily}]}>
                <Text style={[styles.optionsDescription,{fontFamily:this.state.fontFamily, color:this.state.fontColor}]}> Naissance </Text>
                
                <DatePicker
                  style={{width: 160}}
                  date={"03-03-1990"}
                  mode="date"
                  placeholder="select date"
                  format="DD-MM-YYYY"
                  minDate="01-01-1900"
                  maxDate="01-01-2021"
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  customStyles={{
                    dateIcon: {
                      position: 'absolute',
                      left: 0,
                      top: 4,
                      marginLeft: 0
                    },
                    dateInput: {
                      marginLeft: 36,
                      marginRight: 10
                    }
                  }}
                  onDateChange={(date) => {this.setState({date: date})}}
                />
              </View>


            </View>

            <View style={[styles.subMenu, {backgroundColor:this.state.backgroundColor, color:this.state.fontColor, fontSize:this.state.fontSize, borderColor:this.state.fontColor, fontSize:this.state.fontSize, borderTopWidth: 30}]}>
              
              <Text style={[styles.subMenuTitle,{color:this.state.backgroundColor, fontFamily:this.state.fontFamily}]}>{"Options"}</Text>

              <View style={[styles.submenuItem,{color:this.state.backgroundColor, borderColor:this.state.fontColor, fontSize:this.state.fontSize, fontFamily:this.state.fontFamily}]}>
                <Text style={[styles.optionsDescription,{fontFamily:this.state.fontFamily, color:this.state.fontColor}]}> Theme Choser </Text>
                <Text style={[styles.themeChoser, {color: "white", backgroundColor:"black", borderColor:"white"}]} onPress={()=>{this.setState({backgroundColor:"black" , fontColor:"white" })}}  >{"Az"}</Text>
                <Text style={[styles.themeChoser, {color: "black", backgroundColor:"white", borderColor:"black"}]} onPress={()=>{this.setState({backgroundColor:"white" , fontColor:"black" })}}  >{"Az"}</Text>
                <Text style={[styles.themeChoser, {color: "blue", backgroundColor:"yellow",borderColor:"blue"}]} onPress={()=>{this.setState({backgroundColor:"yellow" , fontColor:"blue" })}}   >{"Az"}</Text>
                <Text style={[styles.themeChoser, {color: "yellow", backgroundColor:"blue",  borderColor:"yellow"}]} onPress={()=>{this.setState({backgroundColor:"blue" , fontColor:"yellow" })}} >{"Az"}</Text>
                <Text style={[styles.themeChoser, {color: "red", backgroundColor:"green", borderColor:"red"}]}   onPress={()=>{this.setState({backgroundColor:"green" , fontColor:"red" })}}    >{"Az"}</Text>
                <Text style={[styles.themeChoser, {color: "green", backgroundColor:"red",   borderColor:"green"}]}   onPress={()=>{this.setState({backgroundColor:"red" , fontColor:"green" })}}  >{"Az"}</Text>
              </View>

              <View style={[styles.submenuItem,{color:this.state.backgroundColor, borderColor:this.state.fontColor, fontSize:this.state.fontSize, fontFamily:this.state.fontFamily}]}>
                <Text style={[styles.optionsDescription,{fontFamily:this.state.fontFamily, color:this.state.fontColor}]}> Font choser </Text>
                <Text style={[styles.fontChoser, {backgroundColor:this.state.backgroundColor, fontSize:this.state.fontSize, color:this.state.fontColor, borderColor:this.state.fontColor, fontFamily:"Arial"}]} onPress={()=>{this.setState({fontFamily:"Arial"})}}>Arial</Text>
                <Text style={[styles.fontChoser, {backgroundColor:this.state.backgroundColor, fontSize:this.state.fontSize, color:this.state.fontColor, borderColor:this.state.fontColor, fontFamily:"Georgia"}]} onPress={()=>{this.setState({fontFamily:"Georgia"})}}>Georgia</Text>
                <Text style={[styles.fontChoser, {backgroundColor:this.state.backgroundColor, fontSize:this.state.fontSize, color:this.state.fontColor, borderColor:this.state.fontColor, fontFamily:"Futura"}]} onPress={()=>{this.setState({fontFamily:"Futura"})}}>Futura</Text>
                <Text style={[styles.fontChoser, {backgroundColor:this.state.backgroundColor, fontSize:this.state.fontSize, color:this.state.fontColor, borderColor:this.state.fontColor, fontFamily:"Helvetica"}]} onPress={()=>{this.setState({fontFamily:"Helvetica"})}}>Helvetica</Text>
                <Text style={[styles.fontChoser, {backgroundColor:this.state.backgroundColor, fontSize:this.state.fontSize, color:this.state.fontColor, borderColor:this.state.fontColor, fontFamily:"Optima"}]} onPress={()=>{this.setState({fontFamily:"Optima"})}}>Optima</Text>
                <Text style={[styles.fontChoser, {backgroundColor:this.state.backgroundColor, fontSize:this.state.fontSize, color:this.state.fontColor, borderColor:this.state.fontColor, fontFamily:"Verdana"}]} onPress={()=>{this.setState({fontFamily:"Verdana"})}}>Verdana</Text>
              </View>


              <View style={[styles.submenuItem,{color:this.state.backgroundColor, borderColor:this.state.fontColor, fontSize:this.state.fontSize, fontFamily:this.state.fontFamily}]}>
                <Text style={[styles.optionsDescription,{fontFamily:this.state.fontFamily, color:this.state.fontColor}]}> Font size </Text>
                <VerticalSlider
                  style={styles.fontSizeChoser}
                  value={this.state.fontSize}
                  disabled={false}
                  min={8}
                  max={32}
                  onChange={(value: number) => {
                    this.setState({fontSize: value})
                  }}
                  onComplete={(value: number) => {
                    this.setState({fontSize: value})
                  }}
                  width={0.1 * screenWidth}
                  height={200}
                  step={1}
                  borderRadius={5}
                  minimumTrackTintColor={"gray"}
                  maximumTrackTintColor={"tomato"}
                  ballIndicatorColor={"gray"}
                  ballIndicatorTextColor={"white"}
                >
                </VerticalSlider>
              </View>

            </View>

          </ScrollView>

          <TouchableOpacity 
            style={[styles.leftMenuTransparentCloser, {borderColor: this.state.fontColor}]}
            onPress = {() => {this.toggleLeftMenu();}}>
            <BlurView intensity={40} style={[styles.leftMenuTransparentCloser, {borderColor: this.state.fontColor}]}></BlurView>
          </TouchableOpacity>
        </View>

        <FlatList
          style={styles.suggestionsList}
          data={this.state.lastSuggestions}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          renderItem = {item=>(<Text style={[styles.suggestion,{fontFamily:this.state.fontFamily}]} onPress={()=>{this.askQuestion(item.item.text);}}>{item.item.text+"("+item.item.count+")"}</Text>)}>
        </FlatList>

        <TextInput
          style={[styles.flexTextInput, {backgroundColor: this.state.backgroundColor, color:this.state.fontColor, borderColor: this.state.fontColor, fontFamily:this.state.fontFamily}]}
          maxLength={33}
          placeholderTextColor = "#888888ff"
          placeholder = {this.state.placeholder}
          autoFocus={false} 
          blurOnSubmit={true}
          onChangeText={(value) => {this.setState({ request:value }); this.askQuestion(value);}}
          value={this.state.request}>
        </TextInput>

        <FlatList
          style={[styles.capsuleLists, {backgroundColor:this.state.backgroundColor, color:this.state.fontColor, fontSize:this.state.fontSize}]}
          data={this.state.data}
          showsHorizontalScrollIndicator={false}
          renderItem = {item => (
            <View>
              <Highlighter style={[styles.capsule, {backgroundColor: this.state.backgroundColor, color:this.state.fontColor, fontSize:this.state.fontSize, borderColor:this.state.fontColor, fontSize:this.state.fontSize, fontFamily:this.state.fontFamily}]} 
                highlightStyle={{backgroundColor: 'yellow'}}
                searchWords={[this.state.request]}
                textToHighlight = 
                {
                  "\n"+
                  "Titre: " + item.item.caps.title + "\n\n" + 
                  "Sommaire: " + item.item.caps.summary + "\n\n" + 
                  "Niveau: " + item.item.caps.level + "\n\n" + 
                  "Langue: " + item.item.caps.lang + "\n\n" + 
                  "Date: " + item.item.caps.lastUpdate  + "\n\n"
                }>
              </Highlighter> 

              <TouchableOpacity
                style={styles.miniHeart}
                onPress = {() => {}}>
                <Image
                  style={styles.miniLogo}
                  source={require("./assets/images/heart.webp")}>
                </Image> 
              </TouchableOpacity> 
            </View>
          )}>
        </FlatList>

        <Text style = {[styles.capsuleLists, {color:this.state.fontColor, fontSize:this.state.fontSize}]}>
          {"  " + this.state.description}
        </Text>

        <RadioForm
          style={styles.radio}
          formHorizontal={true}
          labelHorizontal={true}
          buttonColor={'#88aa33ff'}
          radio_props={radioButtonProperties}
          initial={0}
          animation={false}
          onPress={(value) => { this.setState({filtreLangues: value}); this.askQuestion(this.state.request); } }>
        </RadioForm>

        <Image
          style={styles.miniFlagFr}
          source={require("./assets/images/fr_icon.png")}>
        </Image> 
        <Image
          style={styles.miniFlagUk}
          source={require("./assets/images/uk_icon.png")}>
        </Image> 
        <Image
          style={styles.miniFlagWorld}
          source={require("./assets/images/world_icon.png")}>
        </Image> 

    </ScrollView>

    );
  }
}



//NOS STYLES

const styles = StyleSheet.create({
  mainContainer: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    fontFamily: "Arial"
  },
  loadingBlocker:{
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5
  },
  leftMenuInside:{
    flex: 1,
    flexDirection: 'row',
    flexWrap: "wrap",
    position:"absolute",
    left:0,
    width:0.7 * screenWidth,
    height: screenHeight,
    zIndex: 6,
    paddingTop: 0.2 * screenHeight
  },
  subMenu:{
    flexDirection: 'row',
    flexWrap: "wrap",
    width:0.7 * screenWidth,
    alignSelf: 'flex-start'
  },
  subMenuTitle:{
    position:"absolute",
    top:-33,
    right:30,
    color:"black",
    fontSize: 30,
    fontWeight:'bold',
    textAlign: "center"
  },
  submenuItem:{
    alignSelf: 'flex-start',
    textAlign: 'center',
    justifyContent: 'center',
    minWidth:0.1 * screenWidth,
    minHeight: 0.06 * screenWidth,
    margin: 0.02 * screenHeight,
    borderRadius: 0.015 * screenHeight,
    borderWidth:4
  },
  optionsDescription:{
    color:"black",
    marginBottom: 20,
    fontWeight:'bold'
  },
  photoChoser:{
    width:120,
    height:120,    
  },
  themeChoser:{
    width:40,
    height:40,
    borderWidth:5,
    borderRadius:20
  },
  fontChoser:{
    width:100,
    height:40,
    borderWidth:5,
    borderRadius:20,
    fontSize:14,
    marginBottom:4,
    marginLeft:4,
    marginRight:4,
    textAlign: "center"
  },
  fontSizeChoser:{
    height:200,
    width:0.1 * screenWidth,
    marginLeft:30
  },
  optionsSwitch:{
  },
  leftMenuTransparentCloser:{
    position:"absolute",
    right:0,
    width:0.3 * screenWidth + 20,
    height: screenHeight,
    zIndex: 6,
    backgroundColor: 'transparent',
    borderLeftWidth: 20
  },
  flexTextInput: {
    position:'absolute',
    top: 36,
    left: 72,
    right: 10,
    width: screenWidth - 80,
    height: screenHeight * 0.1,
    backgroundColor: '#112666ff',
    fontSize: 28,
    borderRadius: 10,
    color: "white",
    borderWidth: 6
  },
  capsuleLists: {
    flex:1,
    position:'absolute',
    top: 140,
    left: 8,
    width: screenWidth - 16,
    maxHeight: screenHeight - 140,
    backgroundColor: '#880044ff',
    fontSize: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingTop:30,
    paddingBottom:10
  },
  capsule:{
    flex:1,
    position:'relative',
    /*maxHeight:screenHeight - 280,*/
    fontSize: 20,
    borderRadius: 10,
    marginTop:30,
    marginRight:10,
    marginLeft:10,
    marginBottom:-20,
    padding: 0.02 * screenWidth,
    borderWidth: 2
  },
  burger:{
    position:'absolute',
    top: 32,
    left: 2,
    width:64,
    height:64,
    zIndex:4
  },
  addCapsule:{
    position:'absolute',
    top: screenHeight - 68,
    left: 98,
    width:64,
    height:64,
    zIndex:3,
    backgroundColor: "black",
    borderRadius: 32
  },
  heart:{
    position:'absolute',
    top: screenHeight - 68,
    left: 24,
    width:64,
    height:64,
    zIndex:3,
    backgroundColor: "black",
    borderRadius: 32
  },
  miniLogo: {
    width:64,
    height:64
  },
  miniHeart:{
    position:"absolute",
    width:48,
    height:48,
    right:32,
    bottom:0
  },
  miniFlagWorld:{
    position:'absolute',
    top: 175,
    right: 117,
    width:24,
    height:24
  },  
  miniFlagFr:{
    position:'absolute',
    top: 175,
    right: 78,
    width:24,
    height:24
  },
  miniFlagUk:{
    position:'absolute',
    top: 175,
    right: 38,
    width:24,
    height:24
  },
  radio:{
    position:'absolute',
    top: 140,
    right: 24
  },
  suggestionsList: {
    position:"absolute",
    left:72,
    right:10,
    top:112,
    height:50
  },
  suggestion: {
    height:20,
    backgroundColor: "#aaaaaaff",
    color: "#000000ff",
    marginRight:10,
    borderRadius:10,
    paddingLeft:10,
    paddingRight:10,
  },
  buttonPlay: {
    position:"absolute",
    width:32,
    height:32,
    right:20,
    bottom:-10,
    backgroundColor: "#000000ff",
    color: "#ffffffff",
    borderRadius:10
  },
});
