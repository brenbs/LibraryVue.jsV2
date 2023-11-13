<template>
  <v-card>
    <v-card-title>
      <v-text-field v-model="search" append-icon="mdi-magnify" label="Pesquisar" single-line hide-details>
      </v-text-field>
    </v-card-title>
    <v-data-table :headers="headers" :search="search" :items="editoras" :items-per-page="15" sort-by="id"
      class="elevation-1">
      <template v-slot:top>
        <v-toolbar flat>
          <h2>Editoras</h2>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                Nova Editora
              </v-btn>
            </template>
            <v-form ref="editorsForm" @submit.prevent="save">
              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-text-field label="Nome:*" v-model="editora.nome" :rules="geralRules" hide-details="auto"
                      required></v-text-field>
                    <v-text-field label="Cidade:*" v-model="editora.cidade" :rules="geralRules" hide-details="auto"
                      required></v-text-field>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Cancelar
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="addEditor">
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

      editora: {
        id: '',
        nome: '',
        cidade: '',
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
        { text: 'Cidade:', value: 'cidade' },
        { text: 'Ações:', value: 'actions', sortable: false },
      ],
      editoras: [],
      editedItem: {},
      defaultItem: {},
    };
  },
  computed: {
    formTitle() {
      return !this.editora.id ? 'Nova Editora' : 'Atualizar Editora';
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
    save() {
      if (!this.editora.id) {
        editorsApi.save(this.editora).then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Editora adicionada com sucesso!',
            showConfirmButton: false,
            timer: 2000,
          });
          this.getEditors();
          this.close();
          this.$refs.editorsForm.reset();
        })
          .catch(error => {
            console.log(error.response.data.error)
            Swal.fire("Erro ao cadastrar o editora.", error.response.data.error, "error");
          });
      }
      else {
        editorsApi.update(this.editora).then(() => {
          this.editora = {};
          Swal.fire({
            icon: 'success',
            title: 'Editora atualizado com sucesso!',
            showConfirmButton: false,
            timer: 2000,
          });
          this.getEditors();
          this.close();
          this.$refs.editorsForm.reset();
        })
          .catch(error => {
            console.error(error.response.data.error);
            Swal.fire("Erro ao atualizar o editora.", error.response.data.error, "error");
          });
      }
    },

    editItem(item) {
      this.editora.id = item.id; //associa os valores do item do modal com os editoras da api
      this.editora.nome = item.nome;
      this.editora.email = item.email;
      this.editora.endereco = item.endereco;
      this.editora.cidade = item.cidade;
      this.editedIndex = this.editoras.indexOf(item);
      this.dialog = true;
      this.checkFormValidity();
    },

    close() {
      this.dialog = false;
      this.clearForm();
      this.$refs.editorsForm.reset();
    },

    clearForm() {
      this.editora = {
        id: '',
        nome: '',
        email: '',
        endereco: '',
        cidade: '',
      };
    },
    deleteItem(editora) {
      Swal.fire({
        icon: 'warning',
        title: 'Deseja excluir o editora?',
        text: 'Essa ação não pode ser desfeita!',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      }).then(result => {
        if (result.isConfirmed) {
          editorsApi.delete(editora).then(() => {
            this.getEditors();
            this.errors = [];
            Swal.fire({
              icon: 'success',
              title: 'Editora excluído com sucesso!',
              showConfirmButton: false,
              timer: 2000,
            });
          }).catch(e => {
            console.error("Erro ao excluir editora:", e);
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
      this.formIsValid = this.$refs.editorsForm.validate();
    },

    addEditor() {
      this.checkFormValidity();
      if (this.formIsValid) {
        this.save();
      }
    },
  },
  mounted() {
    this.getEditors();
  },
};
</script>
