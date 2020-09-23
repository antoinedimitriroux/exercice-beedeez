# **Explications: quelques Bugs et problèmes**

Bonjour!

Cette application dispose de quelques bugs que je ne suis pas encore parvenu à résoudre:

>Pour sélectionner un filtre de langue, il faut cliquer 2 fois sur un bouton, et non une fois

>Pour ouvrir le menu d'options, il faut (parfois) cliquer 2 fois sur l'icone Beedeez en haut à gauche.

>Normalement, lorsqu'on lance l'application, toutes les capsules devraient s'afficher, au lieu d'aucune.

>Je n'ai pas pu uploader le dossier Node_modules, ma connexion étant trop nulle.

    L'app utilise les packages suivant:
    
        import React, { useRef, useEffect, PureComponent, Component, useState } from 'react';
        
        import { Animated, FlatList, SafeAreaView, TextInput, Keyboard, Dimensions, Slider, Picker, TouchableHighlight, StatusBar, Switch, ScrollView, Text, View, StyleSheet, TouchableOpacity, Button, Image } from 'react-native';
        
        import { Constants } from 'expo';
        
        import { AsyncStorage } from "react-native";
        
        import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
        
        import Highlighter from 'react-native-highlight-words';
        
>Chers utilisateurs, ces bugs devraient résolus d'ici peu :)


# **Evaluation compétence / entretien Beedeez**

Pour cet exercice vous devrez créer une application listant différentes leçons (appelées "capsules"). Pour cela, vous devrez faire une requête sur la route d'API fournie, stocker les capsules dans un reducer ([redux](http://redux.js.org/)) et afficher les capsules sur la page. Une fonctionnalité devra être mise en place pour rechercher une capsule sur la page via une barre de recherche.

La route devant être utilisée est la suivante :

    GET https://api.beedeez.com/api/v1/public/lessons/200/1

Pour cela vous devrez impérativement utiliser les technologies suivantes:

- [node](https://nodejs.org/en/) (Vous pouvez faire un simple serveur [express](https://expressjs.com/) pour renvoyer votre app)
- [react](https://reactjs.org/) (>15.0.0)
- [redux](http://redux.js.org/) & [react-redux](https://github.com/reactjs/react-redux)
- [webpack](https://webpack.github.io/) & [babel](https://babeljs.io/)

Pour faciliter le setup du projet, nous suggerons de se baser sur create-react-native-web-app

Chaque fonctionnalité supplémentaire sera prise en compte en tant que BONUS ! Alors lâchez-vous ;)


## **Recommandation et Bonus**

- **Recommandation** :

- Utiliser [Immutable JS](https://facebook.github.io/immutable-js/) peut s'avérer utile pour garder des fonctions pures dans les reducers
- Utiliser [reselect](https://github.com/reactjs/reselect) peut s'avérer utile pour récupérer les données stockées par redux

- **Bonus**:
*Sachez que ce ne sont que des recommandations, vous êtes libre de mettre en place n'importe quel type de fonctionnalité, tant qu'elle apporte un plus à l'application*

- Implémentation de [Jest](http://facebook.github.io/jest/) pour faire des tests unitaires en react
- Implémentation de [eslint](https://eslint.org/) pour normaliser le code
- Implémenter un système de pagination (vous récupérez 200 leçons). (Attention à ne pas casser la recherche).
- Implémentation de [i18next](https://www.i18next.com/) pour traduire votre app.

Documentation https://reactnative.dev/docs/height-and-width

pour nous envoyer votre résultat, merci de soumettre une Pull Request sur le projet actuel.
En cas de questions, vous pouvez créer une issue sur le projet.

## ***BON COURAGE ! ;-)***

![Beedeez](http://www.jaimelesstartups.fr/wp-content/uploads/2015/07/logo-Beedeez-01.png)
