import {http} from './config'

export default{

 list:()=>{
  return http.get('editoras')
   //aqui entre aspas é meio q a função que to chamando,no caso a de listar(get) usuarios que é como ta la no swagger
  //aqui meio que é a "consulta" a API entao todas as funções do CRUD terão uma dessas 
 },

 save:(editora)=>{
  return http.post('editora',editora)
 },

 update:(editora)=>{
  return http.put('editora',editora)
 },

 delete:(editora) => {
   return http.delete('editora',{data:editora})
 }
}