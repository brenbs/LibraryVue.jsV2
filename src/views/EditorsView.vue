<template>
  <v-card>
    <v-card-title>
      <v-text-field v-model="search" append-icon="mdi-magnify" label="Pesquisar" single-line hide-details>
      </v-text-field>
    </v-card-title>
    <v-data-table 
    :headers="headers" 
    :search="search" 
    :items="publishers" 
    :items-per-page="pageSize" 
    :page="page"
    :server-items-length="total" 
    @update:options="handleOptionsUpdate" 
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
                    <v-text-field label="name:*" v-model="publisher.name" :rules="geralRules" hide-details="auto"
                      required></v-text-field>
                    <v-text-field label="city:*" v-model="publisher.city" :rules="geralRules" hide-details="auto"
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
import publisherApi from '../services/publisherApi';
import Swal from 'sweetalert2';

export default {
  data() {
    return {

      searchValue: null,
      page: 1,
      pageSize: 10,
      orderByProrperty: "id",
      total: 0,
      errors: [],

      formIsValid: false,
      geralRules: [
        v => !!v || 'Campo obrigatório',
      ],

      dialog: false,

      publisher: {
        id: '',
        name: '',
        city: '',
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
        { text: 'Cidade:', value: 'city' },
        { text: 'Ações:', value: 'actions', sortable: false },
      ],
      publishers: [],
      editedItem: {},
      defaultItem: {},
    };
  },
  computed: {
    formTitle() {
      return !this.publisher.id ? 'Nova Editora' : 'Atualizar Editora';
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
    handleOptionsUpdate(options) {
      const sortByMapping = {
        id: "Id",
        name: "Name",
        city: "City",
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
      this.getEditors();
    },

    async getEditors() {
      try {
        const response = await publisherApi.list({
          Page: this.page,
          PageSize: this.pageSize,
          OrderByProperty: this.orderByProperty,
          SearchValue: this.searchValue,
        });
        this.publishers = response.data.data.data;
        this.total = response.data.TotalRegisters;
      } catch {
        console.error("Erro ao Listar :");
        this.publishers = [];
        //console.log(error.response.data.message);
      }
    },

    save() {
      if (!this.publisher.id) {
        publisherApi.save(this.publisher).then(() => {
          Swal.fire({
            icon: 'success',
            title: 'editora adicionada com sucesso!',
            showConfirmButton: false,
            timer: 2000,
          });
          this.getEditors();
          this.close();
          this.$refs.editorsForm.reset();
        })
          .catch(error => {
            console.log(error.response.data.error)
            Swal.fire("Erro ao cadastrar a editora.", error.response.data.error, "error");
          });
      }
      else {
        publisherApi.update(this.publisher).then(() => {
          this.publisher = {};
          Swal.fire({
            icon: 'success',
            title: 'Editora atualizada com sucesso!',
            showConfirmButton: false,
            timer: 2000,
          });
          this.getEditors();
          this.close();
          this.$refs.editorsForm.reset();
        })
          .catch(error => {
            console.error(error.response.data.error);
            Swal.fire("Erro ao atualizar a editora.", error.response.data.error, "error");
          });
      }
    },

    editItem(item) {
      this.publisher.id = item.id; //associa os valores do item do modal com os publishers da api
      this.publisher.city = item.city;
      this.editedIndex = this.publishers.indexOf(item);
      this.dialog = true;
      this.checkFormValidity();
    },

    close() {
      this.dialog = false;
      this.clearForm();
      this.$refs.editorsForm.reset();
    },

    clearForm() {
      this.publisher = {
        id: '',
        name: '',
        city: '',
      };
    },
    deleteItem(publisher) {
      Swal.fire({
        icon: 'warning',
        title: 'Deseja excluira editora?',
        text: 'Essa ação não pode ser desfeita!',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      }).then(result => {
        if (result.isConfirmed) {
          publisherApi.delete(publisher).then(() => {
            this.getEditors();
            this.errors = [];
            Swal.fire({
              icon: 'success',
              title: 'Editora excluído com sucesso!',
              showConfirmButton: false,
              timer: 2000,
            });
          }).catch(e => {
            console.error("Erro ao excluir a editora:", e);
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
