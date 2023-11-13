<template>
  <v-flex>
    <div class="flexbox">
      <div class="chart_container">
        <span class="title text-center">Livros mais alugados</span>
        <canvas ref="myChart" id="myChart"></canvas>
      </div>
    </div>
  </v-flex>
</template>

<script>
import Chart from "chart.js";
import rentalApi from "@/services/rentalApi";

export default {
  data: () => ({
    alugueis: [],
    maisalugados: [],
  }),
  mounted() {
    this.getRentals();
  },
  methods: {
    getRentals() {
      rentalApi.list().then((result) => {
        this.alugueis = result.data;
        this.CalcMaisAlug();
      });
    },

    CalcMaisAlug() {
      const AlugsCount = {};
      this.alugueis.forEach((alug) => {
        const livronome = alug.livro_id.nome;
        if (AlugsCount[livronome]) {
          AlugsCount[livronome]++;
        } else {
          AlugsCount[livronome] = 1;
        }
      });
      this.maisalugados = Object.keys(AlugsCount)
        .sort((a, b) => AlugsCount[b] - AlugsCount[a])
        .map((livronome) => ({ livronome, quantidade: AlugsCount[livronome] }));
    },
    upCharts() {
      
      const ctx = this.$refs.myChart.getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.maisalugados.slice(0, 4).map((livro) => livro.livronome),
          datasets: [
            {
              label: "Quantidade Alugada",
              data: this.maisalugados
                .slice(0, 4)
                .map((livro) => livro.quantidade),
              backgroundColor: [
                "rgb(255, 99, 132)",
                "rgb(54, 162, 235)",
                "rgb(255, 206, 86)",
                "rgb(75, 192, 192)",
                "rgb(153, 102, 255)",
              ],
            },
          ],
        },
        options: {
          legend: {
            display: false,
          },

          scales: {
            x: {
              ticks: {
                callback: function (value) {
                  // Dividir o rótulo em várias linhas usando "\n"
                  return value.split("\n");
                },
                autoSkip: false,
              },
            },
            y: {
              beginAtZero: true,
            },
          },
          maintainAspectRatio: false,
          aspectRatio: 1,
        },
      });
    },
  },
  watch: {
    alugueis: {
      handler() {
        this.upCharts();
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.chart_container {
  width: 100%;
  padding: 10px;
  height: 300px;
  margin-bottom: 25px;
}

.flexbox {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
