<template>
  <v-card>
    <v-card-title>
      <v-text-field v-model="search" append-icon="mdi-magnify" label="Pesquisar" single-line hide-details>
      </v-text-field>
    </v-card-title>
    <v-data-table :headers="headers" :search="search" :items="livros" :items-per-page="15" sort-by="id" class="elevation-1">
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
                    <v-text-field label="Nome:*" v-model="livro.nome" :rules="geralRules" hide-details="auto"
                      required></v-text-field>
                    <v-text-field label="Autor:*" v-model="livro.autor" :rules="geralRules" hide-details="auto"
                      required></v-text-field>
                    <v-select label="Editora:*" v-model="livro.editora" required :items="editoras" item-text="nome">
                    </v-select>
                    <v-text-field label="Lançamento:*" v-model="livro.lancamento" :rules="geralRules" hide-details="auto"
                      required></v-text-field>
                    <v-text-field label="quantidade:*" v-model="livro.quantidade" :rules="geralRules" hide-details="auto"
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
import editorsApi from '../services/editorsApi';
import Swal from 'sweetalert2';

export default {
  data() {
    return {

      //validação

      formIsValid: false,
      geralRules: [
        v => !!v || 'Campo obrigatório',
      ],

      dialog: false,

      livro: {
        id: '',
        nome: '',
        autor: '',
        lancamento: '',
        quantidade: '',
      },
      search: '',
      headers: [
        {
          text: 'Id:',
          align: 'start',
          filterable: false,
          value: 'id',
        },
        { text: 'Nome:', value: 'nome' },
        { text: 'autor:', value: 'autor' },
        { text: 'Editora:', value: 'editora.nome' },
        { text: 'Endereço:', value: 'lancamento' },
        { text: 'Quantidade:', value: 'quantidade' },
        { text: 'Total Alugado:', value: 'totalalugado' },
        { text: 'Ações:', value: 'actions', sortable: false },
      ],

      livros: [],
      editoras: [],
      editedItem: {},
      defaultItem: {},
    };
  },
  computed: {
    formTitle() {
      return !this.livro.id ? 'Novo Livro' : 'Atualizar Livro';
    },
  },
  watch: {
    dialog(val) {
      if (!val) {
        this.close();
      }
    },
    dialogDelete(val) {
      if (!val) {
        this.closeDelete();
      }
    },
  },
  methods: {
    getEditors() {
      editorsApi.list().then((result) => {
        this.editoras = result.data;
      });
    },
    getBooks() {
      booksApi.list().then((result) => {
        this.livros = result.data;
      });
    },
    save() {
      if (!this.livro.id) {
        const selectPublisher = this.editoras.find((editora) =>
          editora.nome = this.livro.editora)
        const bok = {
          nome: this.livro.nome,
          autor: this.livro.autor,
          editora: selectPublisher,
          lancamento: this.livro.lancamento,
          quantidade: this.livro.quantidade
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
            console.log(error.response.data.error)
            Swal.fire("Erro ao cadastrar o livro.", error.response.data.error, "error");
          });
      }
      else {
        const selectedPublisher = this.editoras.find(
          (editora) => editora.nome === this.livro.editora
        );
        const updateBok = {
          id: this.livro.id,
          nome: this.livro.nome,
          autor: this.livro.autor,
          editora: selectedPublisher
            ? { ...selectedPublisher }
            : this.livro.editora,
          lancamento: this.livro.lancamento,
          quantidade: this.livro.quantidade,
        };

        booksApi.update(updateBok).then(() => {
          this.livro = this.livros.map((livro) => {
            if (livro.id === updateBok.id) {
              return updateBok;
            } else {
              return livro;
            }
          });

          Swal.fire({
            icon: 'success',
            title: 'Livro atualizado com sucesso!',
            showConfirmButton: false,
            timer: 2000,
          });
          this.getBooks();
          this.close();
          this.$refs.bookForm.reset();
        })
          .catch(error => {
            console.error(error.response.data.error);
            Swal.fire("Erro ao atualizar o livro.", error.response.data.error, "error");
          });
      }
    },

    editItem(item) {
      const selectedPublisher = this.editoras.find(
        (editora) => editora.nome === item.editora.nome
      );
      this.livro.id = item.id; //associa os valores do item do modal com os livros da api
      this.livro.nome = item.nome;
      this.livro.autor = item.autor;
      this.livro.editora = selectedPublisher;
      this.livro.lancamento = item.lancamento;
      this.livro.quantidade = item.quantidade;
      this.editedIndex = this.livros.indexOf(item);
      this.dialog = true;
      this.checkFormValidity();
    },

    close() {
      this.dialog = false;
      this.clearForm();
      this.$refs.bookForm.reset();
    },

    clearForm() {
      this.livro = {
        id: '',
        nome: '',
        autor: '',
        lancamento: '',
        quantidade: '',
      };
    },
    deleteItem(livro) {
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
          booksApi.delete(livro).then(() => {
            this.getBooks();
            this.errors = [];
            Swal.fire({
              icon: 'success',
              title: 'Livro excluído com sucesso!',
              showConfirmButton: false,
              timer: 2000,
            });
          }).catch(e => {
            console.error("Erro ao excluir livro:", e);
            Swal.fire({
              icon: 'warning',
              title: 'Ocorreu um erro!',
              showConfirmButton: true,
              timer: 2000,
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
