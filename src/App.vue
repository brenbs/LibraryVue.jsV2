<template>
  <v-app>
    <NavBar/><!--Estou informando quero a nav bar aqui em cima dos conteúdos das views-->
    <v-main class="ma-4">
     <router-view>
      <!--Aqui vão ficar as Views-->
     </router-view>
    </v-main>
  </v-app>
</template>

<script>
//Importa os componentes dando um "apelido" a eles.
//NavBar (azul) é o apelido do aqruivo '@/components/NavBar',agora todo o conteúdo desse arquivo esta sendo apelidado para NavBar.

import NavBar from '@/components/NavBar'



export default {

  name:'App',//name: se refere ao endereço que esse componente (NavBar) vai
  components:{//Após importar e dar apelidos a todos os qrquivos que vocêquer,agora é so pôr os apelidos que você deu dentro das chaves.
    NavBar
  }
}
</script>
