import {http} from './config'

export default{

 list:()=>{
  return http.get('book')
   //aqui entre aspas é meio q a função que to chamando,no caso a de listar(get) usuarios que é como ta la no swagger
  //aqui meio que é a "consulta" a API entao todas as funções do CRUD terão uma dessas 
 },

 save:(book)=>{
  return http.post('book',book)
 },

 update:(book)=>{
  return http.put(`book/${book.Id}`,book)
 },

 delete:(book) => {
  return http.delete(`book/${book.Id}`,book)
 }
}