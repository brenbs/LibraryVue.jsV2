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
          {{ users.length }}
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4 text-center text-no-wrap rounded blue darken-4 qnts " to="/Editors">
          <v-icon dark>
            mdi-domain
          </v-icon>
          Editoras:
          {{ publishers.length }}
        </v-card>
      </v-col>
      <v-col>
        <v-card class="pa-4 text-center text-no-wrap rounded blue darken-4 qnts" to="/Books">
          <v-icon dark>
            mdi-book
          </v-icon>
          Livros:
          {{ books.length }}
        </v-card>
      </v-col>
      <v-col>
        <v-card class="pa-4 text-center text-no-wrap rounded blue darken-4 qnts" to="/Rental">
          <v-icon dark>
            mdi-pencil
          </v-icon>
          Aluguéis:
          {{ rentals.length }}
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
              :footer-props="{
                itemsPerPageOptions: [5, 10],
                itemsPerPageText: 'Linhas por página',
                pageText: '{0}-{1} de {2}',
              }"
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
import publisherApi from '../services/publisherApi';
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

      headerProps: {
        sortByText: "Ordenar por",
      },

      headers: [
        { text: 'Nome', value: 'name' },
        { text: 'Quantidade', value: 'stock' },       
      ],

      publishers: [],
      rentals: [],
      books: [],
      users: [],
    }
  },
  methods: {
    getBooks() { 
      booksApi.dashList().then((response) => {
       this.books = response.data.data;
      })
    },

    getEditors() {
      publisherApi.dashList().then((response) => {
        this.publishers = response.data.data;
      }); 
    },

    getRentals() {
      rentalApi.dashList().then((response) => {
        this.rentals = response.data.data;
      });
    },
    
    getUsers() {
      usersApi.dashList().then((response) => {
        this.users = response.data.data;
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
      return this.books.filter(book => book.stock < 6);
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