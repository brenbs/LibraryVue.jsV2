import {http} from './config'

export default{

 list:()=>{
  return http.get('rental')
   //aqui entre aspas é meio q a função que to chamando,no caso a de listar(get) usuarios que é como ta la no swagger
  //aqui meio que é a "consulta" a API entao todas as funções do CRUD terão uma dessas 
 },

 save:(rental)=>{
  return http.post('rental',rental)
 },

 update:(rental)=>{
  return http.put(`rental/${rental.Id}`,rental)
 },

 delete:(rental) => {
  return http.delete(`rental/${rental.Id}`,rental)
 }
}