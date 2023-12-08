<template>
  <v-card>
    <v-card-title>
      <v-text-field v-model="searchValue" append-icon="mdi-magnify" label="Pesquisar" single-line hide-details>
      </v-text-field>
    </v-card-title>
    <v-data-table 
    :headers="headers" 
    :search="searchValue"
    :items="users" 
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
                    <v-text-field label="Endereço:*" v-model="user.address" :rules="geralRules" hide-details="auto"
                      required></v-text-field>
                    <v-text-field label="Cidade:*" v-model="user.city" :rules="geralRules" hide-details="auto"
                      required></v-text-field>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="error" text @click="close">
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

      headerProps: {
        sortByText: "Ordenar por",
      },
      
      searchValue: '',
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

      emailRules: [
        v => !!v || 'Campo Obrigatório',
        v => /.+@.+..+/.test(v) || 'O email deve ser válido',
      ],

      dialog: false,

      user: {
        id: '',
        name: '',
        email: '',
        address: '',
        city: '',
      },
      loadingTable:true,
      headers: [
        {
          text: 'Id:',
          align: 'start',
          filterable: false,
          value: 'id',
        },
        { text: 'Nome:', value: 'name' },
        { text: 'Email:', value: 'email' },
        { text: 'Endereço:', value: 'address' },
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
    searchValue:function(){
    this.getUsers();
    },
  },
  methods: {
    handleOptionsUpdate(options) {
      const sortByMapping = {
        id: "Id",
        name: "Name",
        email: "Email",
        address: "Address",
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
          Desc:this.desc,
        });
        this.users = response.data.data;
        this.total = response.data.totalRegisters;
      } catch {
        console.error("Erro ao Listar :");
        this.users = [];
      }finally {
        this.loadingTable = false;
      }
    },

    save() {
      if (!this.user.id) {
        usersApi.save(this.user).then((response) => {
          Swal.fire({
            icon: 'success',
            title: 'Usuário adicionado com sucesso!',
            showConfirmButton: false,
            timer: 2000,
          });
          console.log(response);
          this.getUsers();
          this.close();
          this.$refs.userForm.reset();
        })
          .catch(error => {
            console.log(error.response.data)
            Swal.fire({
              icon: "error",
              title: "Erro ao adicionar usuário",
              text: error.response.data.message,
              showConfirmButton: false,
              timer: 3000,
            });
          });
      }
      else {
        usersApi.update(this.user).then((response) => {
          this.user = {};
          Swal.fire({
            icon: 'success',
            title: response.data.message,
            showConfirmButton: false,
            timer: 2000,
          });
          this.getUsers();
          this.close();
          this.$refs.userForm.reset();
        })
        .catch(error => {
            console.log(error.response.data)
            Swal.fire({
              icon: "error",
              title: "Erro ao atualizar usuário",
              text: error.response.data.message,
              showConfirmButton: false,
              timer: 3000,
            });
          });
      }
    },

    editItem(item) {
      this.user.id = item.id;
      this.user.name = item.name;
      this.user.email = item.email;
      this.user.address = item.address;
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
        id: 0,
        name: '',
        email: '',
        address: '',
        city: '',
      };
    },
    deleteItem(user) {
      Swal.fire({
        icon: 'warning',
        title: 'Deseja excluir o usuário?',
        text: 'Essa ação não pode ser desfeita!',
        showCancelButton: true,
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
      }).then(result => {
        if (result.isConfirmed) {
          usersApi.delete(user).then(() => {
            this.getUsers();
            this.errors = [];
            Swal.fire({
              icon: 'success',
              title: 'Usuário excluído com sucesso!',
              showConfirmButton: false,
              timer: 2000,
            });
          }).catch(error => {
            console.error("Erro ao excluir o usuário:", error);
            Swal.fire({
              icon: "error",
              title: "Erro ao excluir usuário",
              text: error.response.data.message,
              showConfirmButton: false,
              timer: 3000,
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