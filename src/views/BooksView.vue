<template>
  <v-card>
    <v-card-title>
      <v-text-field v-model="search" append-icon="mdi-magnify" label="Pesquisar" single-line hide-details>
      </v-text-field>
    </v-card-title>
    <v-data-table 
    :headers="headers" 
    :search="search" 
    :items="books" 
    :items-per-page="pageSize"
    :page="page"
    :server-items-length="total" 
    @update:options="handleOptionsUpdate" 
    class="elevation-1">
      <template v-slot:top>
        <v-toolbar flat>
          <h2>Livros</h2>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                Novo Livro
              </v-btn>
            </template>
            <v-form ref="bookForm" @submit.prevent="save">
              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-text-field label="Nome:*" v-model="book.name" :rules="geralRules" hide-details="auto"
                      required></v-text-field>
                    <v-text-field label="Autor:*" v-model="book.author" :rules="geralRules" hide-details="auto"
                      required></v-text-field>
                    <v-select label="Editora:*" v-model="book.publisher" required :items="publishers" item-text="name"
                      item-value="id">
                    </v-select>
                    <v-text-field label="Lançamento:*" v-model="book.release" :rules="geralRules" hide-details="auto"
                      required></v-text-field>
                    <v-text-field label="quantidade:*" v-model="book.stock" :rules="geralRules" hide-details="auto"
                      required></v-text-field>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Cancelar
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="addBook">
                    Ok
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon small @click="deleteItem(item)">
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>
        <span>Sem dados</span>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import booksApi from '../services/booksApi';
import publisherApi from '../services/publisherApi';
import Swal from 'sweetalert2';

export default {
  data() {
    return {

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

      book: {
        id: '',
        name: '',
        author: '',
        publisher: 0,
        release: '',
        stock: '',
        totalRental:0,
      },
      search: '',
      headers: [
        {
          text: 'Id:',
          align: 'start',
          filterable: false,
          value: 'id',
        },
        { text: 'Nome:', value: 'name' },
        { text: 'Autor:', value: 'author' },
        { text: 'Editora:', value: 'publisher.name' },
        { text: 'Ano de Lançamento:', value: 'release' },
        { text: 'Quantidade:', value: 'stock' },
        { text: 'Total Alugado:', value: 'totalRental' },
        { text: 'Ações:', value: 'actions', sortable: false },
      ],

      books: [],
      publishers: [],
      editedItem: {},
      defaultItem: {},
    };
  },
  computed: {
    formTitle() {
      return !this.book.id ? 'Novo Livro' : 'Atualizar Livro';
    },
  },
  watch: {
    dialog(val) {
      if (!val) {
        this.close();
      }
    },
  },
  methods: {
    handleOptionsUpdate(options) {
      const sortByMapping = {
        id: "Id",
        name: "Name",
        author: "Author",
        release: "Release",
        stock: "Stock",
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
      this.getBooks();
    },

    async getEditors() {
      try {
        const response = await publisherApi.list({
          Page: this.page,
          PageSize: this.pageSize,
          OrderByProperty: this.orderByProperty,
          SearchValue: this.searchValue,
        });
        this.publishers = response.data.data;
        this.total = response.data.totalRegisters;
      } catch {
        console.error("Erro ao Listar :");
        this.publishers = [];
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
    save() {
      if (!this.book.id) {
        const selectPublisher = this.publishers.find((publisher) =>
          publisher.name = this.book.publisher)
        const bok = {
          name: this.book.name,
          author: this.book.author,
          publisher: selectPublisher,
          release: this.book.release,
          quantidade: this.book.stock
        };

        booksApi.save(bok).then(() => {
          Swal.fire({
            icon: 'success',
            title: 'livro adicionada com sucesso!',
            showConfirmButton: false,
            timer: 2000,
          });
          this.getBooks();
          this.close();
          this.$refs.bookForm.reset();
        })
          .catch(error => {
            console.log(error.response.data.message)
            Swal.fire({
              icon: "error",
              title: "Erro ao adicionar livro",
              text: error.response.data.message,
              showConfirmButton: false,
              timer: 3000,
            });
          });
      }
      else {
        const selectedPublisher = this.publishers.find(
          (publisher) => publisher.name === this.book.publisher
        );
        const updateBok = {
          id: this.book.id,
          name: this.book.name,
          author: this.book.author,
          publisher: selectedPublisher
            ? { ...selectedPublisher }
            : this.book.publisher,
          release: this.book.release,
          stock: this.book.stock,
        };

        booksApi.update(updateBok).then(() => {
          this.book = this.books.map((book) => {
            if (book.id === updateBok.id) {
              return updateBok;
            } else {
              return book;
            }
          });

          Swal.fire({
            icon: 'success',
            title: 'book atualizado com sucesso!',
            showConfirmButton: false,
            timer: 2000,
          });
          this.getBooks();
          this.close();
          this.$refs.bookForm.reset();
        })
          .catch(error => {
            console.log(error.response.data.message)
            Swal.fire({
              icon: "error",
              title: "Erro ao adicionar livro",
              text: error.response.data.message,
              showConfirmButton: false,
              timer: 3000,
            });
          });
      }
    },

    editItem(item) {
      const selectedPublisher = this.publishers.find(
        (publisher) => publisher.name === item.publisher.name
      );
      this.book.id = item.id; //associa os valores do item do modal com os books da api
      this.book.name = item.name;
      this.book.author = item.author;
      this.book.publisher = selectedPublisher;
      this.book.release = item.release;
      this.book.stock = item.stock;
      this.editedIndex = this.books.indexOf(item);
      this.dialog = true;
      this.checkFormValidity();
    },

    close() {
      this.dialog = false;
      this.clearForm();
      this.$refs.bookForm.reset();
    },

    clearForm() {
      this.book = {
        id: '',
        name: '',
        author: '',
        release: '',
        stock: '',
      };
    },
    deleteItem(book) {
      Swal.fire({
        icon: 'warning',
        title: 'Deseja excluir o livro?',
        text: 'Essa ação não pode ser desfeita!',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      }).then(result => {
        if (result.isConfirmed) {
          booksApi.delete(book).then(() => {
            this.getBooks();
            this.errors = [];
            Swal.fire({
              icon: 'success',
              title: 'Livro excluído com sucesso!',
              showConfirmButton: false,
              timer: 2000,
            });
          }).catch(error => {
            console.log(error.response.data.message)
            Swal.fire({
              icon: "error",
              title: "Erro ao excluir livro",
              text: error.response.data.message,
              showConfirmButton: false,
              timer: 3000,
            });
          });
        }
      })
    },

    checkFormValidity() {
      this.formIsValid = this.$refs.bookForm.validate();
    },

    addBook() {
      this.checkFormValidity();
      if (this.formIsValid) {
        this.save();
      }
    },
  },
  mounted() {
    this.getBooks();
    this.getEditors();
  },
};
</script>