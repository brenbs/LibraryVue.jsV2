<template>
  <v-card>
    <v-card-title>
      <v-text-field v-model="search" append-icon="mdi-magnify" label="Pesquisar" single-line hide-details>
      </v-text-field>
    </v-card-title>
    <v-data-table 
    :headers="headers" 
    :search="search" 
    :items="users" 
    :items-per-page="pageSize" 
    :page="page"
    :server-items-length="total" 
    @update:options="handleOptionsUpdate" 
    class="elevation-1">
      <template v-slot:top>
        <v-toolbar flat>
          <h2>Usuários</h2>
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                Novo Usuário
              </v-btn>
            </template>
            <v-form ref="userForm" @submit.prevent="save">
              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-text-field label="Nome:*" v-model="user.name" :rules="geralRules" hide-details="auto"
                      required></v-text-field>
                    <v-text-field label="Email:*" v-model="user.email" :rules="emailRules" hide-details="auto"
                      required></v-text-field>
                    <v-text-field label="Endereço:*" v-model="user.adress" :rules="geralRules" hide-details="auto"
                      required></v-text-field>
                    <v-text-field label="Cidade:*" v-model="user.city" :rules="geralRules" hide-details="auto"
                      required></v-text-field>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Cancelar
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="addUser">
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
import usersApi from '../services/usersApi';
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

      emailRules: [
        v => !!v || 'Campo Obrigatório',
        v => /.+@.+..+/.test(v) || 'O email deve ser válido',
      ],

      dialog: false,

      user: {
        id: '',
        name: '',
        email: '',
        adress: '',
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
        { text: 'Email:', value: 'email' },
        { text: 'Endereço:', value: 'adress' },
        { text: 'Cidade:', value: 'city' },
        { text: 'Ações:', value: 'actions', sortable: false },
      ],
      users: [],
      editedItem: {},
      defaultItem: {},
    };
  },
  computed: {
    formTitle() {
      return !this.user.id ? 'Novo Usuário' : 'Atualizar Usuário';
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
        email: "Email",
        adress: "Adress",
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
      this.getUsers();
    },

    async getUsers() {
      try {
        const response = await usersApi.list({
          Page: this.page,
          PageSize: this.pageSize,
          OrderByProperty: this.orderByProperty,
          SearchValue: this.searchValue,
        });
        this.users = response.data.data.data;
        this.total = response.data.TotalRegisters;
      } catch {
        console.error("Erro ao Listar :");
        this.users = [];
        //console.log(error.response.data.message);
      }
    },

    save() {
      if (!this.user.id) {
        usersApi.save(this.user).then(() => {
          Swal.fire({
            icon: 'success',
            title: 'usuario adicionado com sucesso!',
            showConfirmButton: false,
            timer: 2000,
          });
          this.getUsers();
          this.close();
          this.$refs.userForm.reset();
        })
          .catch(error => {
            console.log(error.response.data.error)
            Swal.fire("Erro ao cadastrar o usuário.", error.response.data.error, "error");
          });
      }
      else {
        usersApi.update(this.user).then(() => {
          this.user = {};
          Swal.fire({
            icon: 'success',
            title: 'Usuário atualizado com sucesso!',
            showConfirmButton: false,
            timer: 2000,
          });
          this.getUsers();
          this.close();
          this.$refs.userForm.reset();
        })
          .catch(error => {
            console.error(error.response.data.error);
            Swal.fire("Erro ao atualizar o usuário.", error.response.data.error, "error");
          });
      }
    },

    editItem(item) {
      this.user.id = item.id; //associa os valores do item do modal com os usuarios da api
      this.user.name = item.name;
      this.user.email = item.email;
      this.user.adress = item.adress;
      this.user.city = item.city;
      this.editedIndex = this.users.indexOf(item);
      this.dialog = true;
      this.checkFormValidity();
    },

    close() {
      this.dialog = false;
      this.clearForm();
      this.$refs.userForm.reset();
    },

    clearForm() {
      this.user = {
        id: '',
        name: '',
        email: '',
        adress: '',
        city: '',
      };
    },
    deleteItem(user) {
      Swal.fire({
        icon: 'warning',
        title: 'Deseja excluir o usuário?',
        text: 'Essa ação não pode ser desfeita!',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      }).then(result => {
        if (result.isConfirmed) {
          usersApi.delete(user).then(() => {
            this.getUsers();
            this.errors = [];
            Swal.fire({
              icon: 'success',
              title: 'usuario excluído com sucesso!',
              showConfirmButton: false,
              timer: 2000,
            });
          }).catch(e => {
            console.error("Erro ao excluir usuario:", e);
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
      this.formIsValid = this.$refs.userForm.validate();
    },

    addUser() {
      this.checkFormValidity();
      if (this.formIsValid) {
        this.save();
      }
    },
  },
  mounted() {
    this.getUsers();
  },
};
</script>
