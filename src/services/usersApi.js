import {http} from './config'

export default{

 list:()=>{
  return http.get('users')
   //aqui entre aspas é meio q a função que to chamando,no caso a de listar(get) users que é como ta la no swagger
  //aqui meio que é a "consulta" a API entao todas as funções do CRUD terão uma dessas 
 },

 save:(user)=>{
  return http.post('user',user)
 },

 update:(user)=>{
  return http.put(`user/${user.Id}`,user)
 },

 delete:(user) => {
   return http.delete(`user/${user.Id}`,user)
 }
}