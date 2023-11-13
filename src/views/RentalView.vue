<template>
  <v-card>
    <v-card-title>
      <v-text-field v-model="search" append-icon="mdi-magnify" label="Pesquisar" single-line hide-details>
      </v-text-field>
    </v-card-title>
    <v-data-table :options="tableOptions" :headers="headers" :search="search" :items="alugueis" :items-per-page="15"
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
            <v-form ref="form" @submit.prevent="save">
              <v-card>
                <v-card-title>
                  <span class="text-h5">Novo Aluguel:</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-select label="Livro:*" v-model="aluguel.livro_id" required :items="livros" item-text="nome"
                      :rules="[(v) => !!v || 'Livro é obrigatório']">
                    </v-select>
                    <v-select label="Usuário:*" v-model="aluguel.usuario_id" required :items="usuarios" item-text="nome"
                      :rules="[(v) => !!v || 'Livro é obrigatório']">
                    </v-select>
                    <v-text-field label="Data de Aluguel:*" v-model="aluguel.data_aluguel" hide-details="auto" required
                      type="date" :rules="geralRules">
                    </v-text-field>
                    <v-text-field label="Previsão de Entrega:*" v-model="aluguel.data_previsao" hide-details="auto" required
                      type="date" :rules="geralRules">
                    </v-text-field>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
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
      <template v-slot:[`item.data_aluguel`]="{ item }">
        <td>{{ formatDate(item.data_aluguel) }}</td>
      </template>
      <template v-slot:[`item.data_previsao`]="{ item }">
        <td>{{ formatDate(item.data_previsao) }}</td>
      </template>
      <template v-slot:[`item.status`]="{ item }">
        <td>
          <v-chip :class="statusClass(item)" class="white--text">{{
            (item.status = statusCalculado(item))
          }}</v-chip>
        </td>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <span>
          <v-icon v-for="icon in getAction(item)" :key="icon" @click="
            icon === 'mdi-book' ? devItem(item) : icon === 'mdi-delete' ? deleteItem(item) : null
            ">
            {{ icon }}
          </v-icon>
        </span>
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
  data() {
    return {

      //validação

      formIsValid: false,
      geralRules: [
        v => !!v || 'Campo obrigatório',
      ],

      dateRentRules: [
        v => !!v || 'Campo obrigatório',
      ],

      dialog: false,

      aluguel: {
        id: "",
        livro_id: "",
        usuario_id: "",
        data_aluguel: new Date().toISOString().substr(0, 10),
        data_previsao: "",
        data_devolucao: "",
        status: "",
        selectedAlugId: null,
      },


      search: '',

      tableOptions: {
        sortBy: ['id'],
        sortDesc: [true]
      },

      headers: [
        {
          text: 'Id:',
          align: 'start',
          filterable: false,
          value: 'id',
        },
        { text: 'Livro:', value: 'livro_id.nome' },
        { text: 'Usuário:', value: 'usuario_id.nome' },
        { text: 'Data de Aluguel:', value: 'data_aluguel' },
        { text: 'Data de Previsão:', value: 'data_previsao' },
        { text: 'Status:', value: 'status' },
        { text: 'Ações:', value: 'actions', sortable: false },
      ],

      alugueis: [],
      livros: [],
      usuarios: [],
      editedItem: {},
      defaultItem: {},
    };
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

    getRentals() {
      rentalApi.list().then((result) => {
        this.alugueis = result.data;
      });
    },

    getBooks() {
      booksApi.list().then((result) => {
        this.livros = result.data;
      });
    },

    getUsers() {
      usersApi.list().then((result) => {
        this.usuarios = result.data;
      });
    },

    save() {
      const selectBook = this.livros.find((livro) =>
        livro.nome === this.aluguel.livro_id)

      const selectUser = this.usuarios.find((usuario) =>
        usuario.nome === this.aluguel.usuario_id)

      const rentBook = {
        livro_id: selectBook,
        usuario_id: selectUser,
        data_aluguel: this.aluguel.data_aluguel,
        data_previsao: this.aluguel.data_previsao,
        status: "Pendente"
      };

      rentalApi.save(rentBook).then((response) => {
        this.alugueis.push({ id: response.data.id, ...rentBook });
        Swal.fire({
          icon: 'success',
          title: 'Aluguel adicionado com sucesso!',
          showConfirmButton: false,
          timer: 2000,
        });
        this.getRentals();
        this.close();
      })
        .catch(error => {
          console.error(error.response.data.error);
          Swal.fire("Erro!", error.response.data.error, "error");
        });
    },

    devItem(item) {
      Swal.fire({
        title: "Devolver livro?!",
        text: "Tem certeza que deseja fazer isso ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        confirmButtonColor: "#1976d2",
        cancelButtonText: "Cancelar",
        cancelButtonColor: "#ff5252",
      }).then((result) => {
        if (result.isConfirmed) {
          this.devolver(item);
        }
      });
    },

    devolver(aluguel) {
      if (aluguel.data_devolucao == null) {
        this.selectedAlugId = aluguel.id;
        this.aluguel.livro_id = aluguel.livro_id;
        this.aluguel.usuario_id = aluguel.usuario_id;
        this.data_aluguel = aluguel.data_aluguel;
        this.data_previsao = aluguel.data_previsao;
        this.confirmDevol();
      } else {
        Swal.fire("O livro já foi devolvido!", "", "error");
      }
    },

    confirmDevol() {
      const selectBook = this.livros.find((livro) =>
        livro.nome === this.aluguel.livro_id)

      const selectUser = this.usuarios.find((usuario) =>
        usuario.nome === this.aluguel.usuario_id)

      const RentalDevo = {
        id: this.selectedAlugId,
        livro_id: selectBook ? { ...selectBook } : this.aluguel.livro_id,
        usuario_id: selectUser ? { ...selectUser } : this.aluguel.usuario_id,
        data_aluguel: this.data_aluguel,
        data_previsao: this.data_previsao,
        data_devolucao: new Date().toISOString().substr(0, 10),
        status: "Devolvido",
      };
      rentalApi.update(RentalDevo).then(() => {
        this.alugueis = this.alugueis.map((aluguel) => {
          if (this.selectedALugId === RentalDevo.id) {
            return RentalDevo;
          } else {
            return aluguel;
          }
        });
        Swal.fire({
          icon: "success",
          title: "Devolução realizada com sucesso!",
          showConfirmButton: false,
          timer: 2000,
        });
        this.getRentals();
      });
    },

    close() {
      this.dialog = false;
      this.clearForm();
      this.$refs.form.reset()
    },

    clearForm() {
      this.aluguel = {
        id: "",
        livro_id: "",
        usuario_id: "",
        data_aluguel: new Date().toISOString().substr(0, 10),
        data_previsao: "",
        data_devolucao: "",
        status: "",
        selectedAlugId: null,
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
    // calculo do status
    statusCalculado(aluguel) {
      const hoje = new Date();
      const previsao = new Date(aluguel.data_previsao);
      if (aluguel.data_devolucao === null) {
        if (hoje > previsao) {
          return "Em atraso";
        } else {
          return "Pendente";
        }
      } else {
        return "Devolvido";
      }
    },
    //para dizer a cor do status
    statusClass(aluguel) {
      if (aluguel.data_devolucao === null) {
        const hoje = new Date();
        const previsao = new Date(aluguel.data_previsao);

        if (hoje > previsao) {
          return "red";
        } else {
          return "yellow";
        }
      } else {
        return "green";
      }
    },

    //fomatar as datas para o padrão
    formatDate(dateString) {
      const utcDate = new Date(dateString);
      const localDate = new Date(
        utcDate.getTime() + utcDate.getTimezoneOffset() * 60000
      );
      return localDate.toLocaleDateString("pt-BR");
    },

    removeRent(aluguelId) {
      this.alugueis = this.alugueis.filter(
        (aluguel) => aluguel.id !== aluguelId
      );
    },

    deleteItem(aluguel) {
      Swal.fire({
        title: "Deletar Aluguel?!",
        text: "Tem certeza que deseja fazer isso ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        confirmButtonColor: "#1976d2",
        cancelButtonText: "Cancelar",
        cancelButtonColor: "#ff5252",
      }).then((result) => {
        if (result.isConfirmed) {
          const deleteRent = {
            id: aluguel.id,
            livro_id: aluguel.livro_id,
            usuario_id: aluguel.usuario_id,
            data_aluguel: aluguel.data_aluguel,
            data_previsao: aluguel.data_previsao
          }
          rentalApi.delete(aluguel).then(() => {
            Swal.fire({
              icon: "success",
              title: "Deletado com sucesso!",
              showConfirmButton: false,
              timer: 2000,
            });
            this.removeRent(deleteRent.id);
          })
        }
      })
    },

    getAction(item) {
      const devolution = item.data_devolucao;

      if (devolution !== null) {
        return '';
      } else if (devolution === null) {
        return ['mdi-book', 'mdi-delete'];
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
