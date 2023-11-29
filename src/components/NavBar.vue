<template>
    <nav>
      <v-app-bar dark app>
        <v-app-bar-nav-icon @click="toggleMenu" color="white"></v-app-bar-nav-icon>
        <v-toolbar-title class="text-uppercase">
          <img src="/altislab.png" alt="AltisLab logo">
        </v-toolbar-title>
      <v-spacer></v-spacer>
      </v-app-bar>
      <v-navigation-drawer v-model="drawer" dark app class="blue darken-4">
        <v-layout column align-center>
          <v-flex class="mt-5">
            <v-img src="/altioslogo.png" class="logol"></v-img>
          </v-flex>
        </v-layout>
        <v-list flat>
          <v-list-item v-for="link in links" :key="link.text" router :to="link.route" active-class="border">
            <v-list-item-action>
              <v-icon>{{link.icon}}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{link.text}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </nav>
  </template>
  
  <script>
   export default{
    data:()=>({
      drawer:true,
      links:[
        {icon:'mdi-widgets',text:'Dashboard',route:'/'},
        {icon:'mdi-account',text:'Usuários',route:'/Users'},
        {icon:'mdi-domain',text:'Editoras',route:'/Editors'},
        {icon:'mdi-book',text:'Livros',route:'/Books'},
        {icon:'mdi-pencil',text:'Aluguéis',route:'/Rental'}
      ]
    }),
    methods:{
      toggleMenu(){
        this.drawer = !this.drawer;
      }
    }
  }
  </script>
  <style scoped>
  .logol{
    width:220px;
  }
  </style>