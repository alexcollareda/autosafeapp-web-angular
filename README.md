## Terminal Commands

1. Install NodeJs from [NodeJs Official Page](https://nodejs.org/en).
2. Open Terminal
3. Go to your file project
4. Run in terminal: ```npm install -g @angular/cli```
5. Then: ```npm install```
6. And: ```npm start```
7. Navigate to [localhost:4200](localhost:4200)

## Visual Studio Code
Criacao de uma nova Tela (Componente)
1. ng generate component public/register
2. Deve registrar o novo componente na app.routing.ts (Dentro do routing temos dois tipos de rotas, rotas sem login, rotas com login para telas protegidas que poderao ser acessadas apos fazer o login)
3. Para fazer redirecionamento: [routerLink]="['/public/register']"
4. O sistema conta com duas barras de navegacao, a barra que fica em cima do da tela, que direciona para os meus, navbar e navbar-logged, sendo a logged o menu para area logada