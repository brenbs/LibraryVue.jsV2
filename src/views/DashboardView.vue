<template>
  <div class="container-father">
    <h1>Dashboard</h1>
    <v-row>
      <v-col cols="12" md="3">
        <v-card class="pa-4 text-center text-no-wrap rounded blue darken-4 qnts" to="/Users">
          <v-icon dark>
            mdi-account
          </v-icon>
          Usuários:
          {{ usuarios.length }}
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4 text-center text-no-wrap rounded blue darken-4 qnts " to="/Editors">
          <v-icon dark>
            mdi-domain
          </v-icon>
          Editoras:
          {{ editoras.length }}
        </v-card>
      </v-col>
      <v-col>
        <v-card class="pa-4 text-center text-no-wrap rounded blue darken-4 qnts" to="/Books">
          <v-icon dark>
            mdi-book
          </v-icon>
          Livros:
          {{ livros.length }}
        </v-card>
      </v-col>
      <v-col>
        <v-card class="pa-4 text-center text-no-wrap rounded blue darken-4 qnts" to="/Rentals">
          <v-icon dark>
            mdi-pencil
          </v-icon>
          Aluguéis:
          {{ alugueis.length }}
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <!-- Grafico -->
        <BarChart/>
      </v-col>
      <v-col>
        <div class="container-tabs">
        <span>Livros em Falta:(estoque com menos de 6 livros) </span>
      <!--Tabela-->
      <v-simple-table>
        <template v-slot:default>
          <tbody>
            <v-data-table
              :headers="headers"
              :items="filteredBooks"
              :items-per-page="5"
              class="elevation-1"
            ></v-data-table>
          </tbody>
        </template>
      </v-simple-table>
    </div>
      </v-col>
    </v-row>
  </div>
</template>
 
<script>
import editorsApi from '../services/publisherApi';
import usersApi from '../services/usersApi';
import rentalApi from '../services/rentalApi';
import booksApi from '../services/booksApi';
import BarChart from '@/components/charts/barChart.vue';


export default {

 name:"Dashboard",
 
  components:{
    BarChart,
  },

  data() {
    return {
      headers: [
        { text: 'Nome', value: 'nome' },
        { text: 'Quantidade', value: 'quantidade' },       
      ],

      editoras: [],
      alugueis: [],
      livros: [],
      usuarios: [],
    }
  },
  methods: {
    getBooks() { 
      booksApi.list().then((result) => {
       this.livros = result.data;
      })
    },

    getEditors() {
      editorsApi.list().then((result) => {
        this.editoras = result.data;
      }); 
    },

    getRentals() {
      rentalApi.list().then((result) => {
        this.alugueis = result.data;
      });
    },

    
    getUsers() {
      usersApi.list().then((result) => {
        this.usuarios = result.data;
      });
    },
  },
  
  mounted() {
    this.getRentals();
    this.getBooks();
    this.getUsers();
    this.getEditors();
  },

  computed:{
    filteredBooks() {
      return this.livros.filter(livro => livro.quantidade < 6);
    },
  }
}
</script>
 
<style scoped>
.container-father {
  border: 1px solid #eeee;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin-top: 3%;
  margin-left: 3%;
}
.qnts {
  color: white;
}
</style>