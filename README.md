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

pour nous envoyer votre résultat, merci de soumettre une Pull Request sur le projet actuel.
En cas de questions, vous pouvez créer une issue sur le projet.

## ***BON COURAGE ! ;-)***

![Beedeez](http://www.jaimelesstartups.fr/wp-content/uploads/2015/07/logo-Beedeez-01.png)
