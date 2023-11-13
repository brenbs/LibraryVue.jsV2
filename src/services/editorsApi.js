import {http} from './config'

export default{

 list:()=>{
  return http.get('publisher')
   //aqui entre aspas é meio q a função que to chamando,no caso a de listar(get) usuarios que é como ta la no swagger
  //aqui meio que é a "consulta" a API entao todas as funções do CRUD terão uma dessas 
 },

 save:(publisher)=>{
  return http.post('publisher',publisher)
 },

 update:(publisher)=>{
  return http.put(`publisher/${publisher.Id}`,publisher)
 },

 delete:(publisher) => {
   return http.delete(`publisher/${publisher.Id}`,publisher)
 }
}