<template>
  <v-card>
    <v-card-title>
      <v-text-field v-model="search" append-icon="mdi-magnify" label="Pesquisar" single-line hide-details>
      </v-text-field>
    </v-card-title>
    <v-data-table 
    :headers="headers" 
    :search="search" 
    :items="rentals" 
    :items-per-page="pageSize" 
    :page="page"
    :loading="loadingTable"
    :server-items-length="total" 
    @update:options="handleOptionsUpdate" 
    :footer-props="{
        itemsPerPageOptions: [5, 10, 25, this.total],
        itemsPerPageText: 'Linhas por página',
        pageText: '{0}-{1} de {2}',
      }" 
    class="elevation-1">
      <template v-slot:top>
        <v-toolbar flat>
          <h2>Aluguéis</h2>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                Novo aluguel
              </v-btn>
            </template>
            <v-form ref="rentalForm" @submit.prevent="save">
              <v-card>
                <v-card-title>
                  <span class="text-h5">Novo Aluguel:</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-autocomplete label="Livro:*" v-model="rental.book" required :items="books" item-text="name"
                      item-value="id">
                    </v-autocomplete>
                    <v-autocomplete label="Usuário:*" v-model="rental.user" required :items="users" item-text="name"
                      item-value="id">
                    </v-autocomplete>
                    <v-text-field label="Data de Aluguel:*" v-model="rental.rentalDate" hide-details="auto" required
                      type="date" :rules="geralRules" >
                    </v-text-field>
                    <v-text-field label="Previsão de Entrega:*" v-model="rental.forecastDate" hide-details="auto" required
                      type="date" :rules="geralRules">
                    </v-text-field>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="error" text @click="close">
                    Cancelar
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="addRental">
                    Ok
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:[`item.status`]="{ item }">
        <td>
          <v-chip :class="statusClass(item)" class="white--text">{{
            item.status
          }}</v-chip>
        </td>
      </template>
      <template slot="item.actions" slot-scope="{ item }">
        <v-btn v-if="item.status == 'Pendente'" text small @click="BookReturn(item)">
          <v-icon class="green--text">mdi-book</v-icon>
        </v-btn>
      </template>
      <template v-slot:[`item.rentalDate`]="{ item }">
        <td>{{ item.rentalDate | formatDate }}</td>
      </template>
      <template v-slot:[`item.forecastDate`]="{ item }">
        <td>{{ item.forecastDate | formatDate }}</td>
      </template>
      <template v-slot:[`item.devolutionDate`]="{ item }">
        <td>
          {{ item.devolutionDate | formatDate }}
        </td>
        <td v-if="item.devolutionDate == null" style="font-style: italic; color: #a2a2a2">
          ...
        </td>
      </template>
      <template v-slot:no-data>
        <span>Sem dados</span>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import rentalApi from '../services/rentalApi';
import booksApi from '../services/booksApi';
import usersApi from '../services/usersApi'
import Swal from 'sweetalert2';

export default {

  filters: {
    formatDate: function (value) {
      if (value) {
        const date = new Date(value);
        return date.toLocaleDateString("pt-BR");
      }
      return "";
    },
  },

  data() {
    return {

      headerProps: {
        sortByText: "Ordenar por",
      },

      searchValue: "",
      page: 1,
      pageSize: 5,
      orderByProperty: "id",
      total: 0,
      desc: false,
      errors: [],

      formIsValid: false,
      geralRules: [
        v => !!v || 'Campo obrigatório',
      ],

      dialog: false,

      rental: {
        id: "",
        book: "",
        user: "",
        rentalDate: new Date().toISOString().substr(0, 10),
        forecastDate: "",
        devolutionDate: "",
        status: "",
      },
      loadingTable:true,
      search: '',

      headers: [
        {
          text: 'Id:',
          align: 'start',
          filterable: false,
          value: 'id',
        },
        { text: 'Livro:', value: 'book.name' },
        { text: 'Usuário:', value: 'user.name' },
        { text: 'Data de Aluguel:', value: 'rentalDate' },
        { text: 'Data de Previsão:', value: 'forecastDate' },
        { text: 'Data de Devolução:', value: 'devolutionDate' },
        { text: 'Status:', value: 'status' },
        { text: 'Ações:', value: 'actions', sortable: false },
      ],

      rentals: [],
      books: [],
      users: [],
      editedItem: {},
      defaultItem: {},
    };
  },

  watch: {
    dialog(val) {
      if (!val) {
        this.close();
      }
    }
  },
  methods: {
    handleOptionsUpdate(options) {
      const sortByMapping = {
        id: "Id",
        userId: "UserId",
        bookId: "BookId",
        rentalDate: "RentalDate",
        forecastDate: "ForecastDate",
      };
      if (options.sortBy[0] || options.sortDesc[0]) {
        this.orderByProperty = sortByMapping[options.sortBy[0]];
        this.desc = options.sortDesc[0];
      } else {
        this.orderByProperty = "Id";
        this.desc = false;
      }
      this.pageSize = options.itemsPerPage;
      this.page = options.page;
      this.total = options.itemsPerPage;
      this.itemsPerPage = options.itemsPerPage;
      this.getRentals();
    },

    async getRentals() {
      try {
        const response = await rentalApi.list({
          Page: this.page,
          PageSize: this.pageSize,
          OrderByProperty: this.orderByProperty,
          SearchValue: this.searchValue,
        });
        this.rentals = response.data.data;
        this.total = response.data.totalRegisters;
      } catch {
        console.error("Erro ao Listar :");
        this.rentals = [];
      }finally {
        this.loadingTable = false;
      }
    },

    async getBooks() {
      try {
        const response = await booksApi.list({
          Page: this.page,
          PageSize: this.pageSize,
          OrderByProperty: this.orderByProperty,
          SearchValue: this.searchValue,
        });
        this.books = response.data.data;
        this.total = response.data.totalRegisters;
        console.log(this.books);
      } catch {
        console.error("Erro ao Listar :");
        this.books = [];
      }
    },

    async getUsers() {
      try {
        const response = await usersApi.list({
          Page: this.page,
          PageSize: this.pageSize,
          OrderByProperty: this.orderByProperty,
          SearchValue: this.searchValue,
        });
        this.users = response.data.data;
        this.total = response.data.totalRegisters;
      } catch {
        console.error("Erro ao Listar :");
        this.users = [];
      }
    },

    save() {
      
      const rentBook = {
        bookId: this.rental.book,
        userId: this.rental.user,
        rentalDate: this.rental.rentalDate,
        forecastDate: this.rental.forecastDate
      };

      rentalApi.save(rentBook).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Aluguel adicionado com sucesso!',
          showConfirmButton: false,
          timer: 2000,
        });
        this.getRentals();
        this.close();
      })
        .catch(error =>  {
            console.log(error.response.data.message)
            Swal.fire({
              icon: "error",
              title: "Erro ao adicionar aluguél",
              text: error.response.data.message,
              showConfirmButton: false,
              timer: 3000,
            });
          });
    },

    BookReturn(item) {
      Swal.fire({
        icon: "warning",
        title: "Deseja Devolver o livro?",
        text: "Essa ação não pode ser desfeita!",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      }).then((result) => {
        if (result.isConfirmed) {
          const returnRental = {
            id: item.id,
            devolutionDate: new Date().toISOString().substr(0, 10),
          };
          rentalApi.update(returnRental).then(() => {
            Swal.fire({
              icon: "success",
              title: "Livro devolvido com sucesso!",
              showConfirmButton: false,
              timer: 2000,
            });

            this.getRentals();
          });
        }
      });
    },

    close() {
      this.dialog = false;
      this.clearForm();
      this.$refs.rentalForm.resetValidation()
    },

    clearForm() {
      this.rental = {
        id: "",
        bookId: "",
        userId: "",
        rentalDate: new Date().toISOString().substr(0, 10),
        forecastDate: "",
        devolutionDate: "",
        status: "",
      };
    },

    checkFormValidity() {
      this.formIsValid = this.$refs.rentalForm.validate();
    },

    addRental() {
      this.checkFormValidity();
      if (this.formIsValid) {
        this.save();
      }
    },

    statusClass(item) {
      if (item.status == "Em atraso") {
        return "red";
      } else if (item.status == "No prazo") {
        return "green";
      } else {
        return "yellow";
      }
    },
  },

  mounted() {
    this.getRentals();
    this.getBooks();
    this.getUsers();
  },
};
</script>
<style >
.swal2-popup {
  font-family: "Arial", sans-serif;
}

.swal2-title {
  font-size: 31px;
}
</style>