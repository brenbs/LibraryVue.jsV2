import {http} from './config'

export default{

 list:()=>{
  return http.get('alugueis')
   //aqui entre aspas é meio q a função que to chamando,no caso a de listar(get) usuarios que é como ta la no swagger
  //aqui meio que é a "consulta" a API entao todas as funções do CRUD terão uma dessas 
 },

 save:(aluguel)=>{
  return http.post('aluguel',aluguel)
 },

 update:(aluguel)=>{
  return http.put('aluguel',aluguel)
 },

 delete:(aluguel) => {
  return http.delete('aluguel',{data:aluguel})
 }
}