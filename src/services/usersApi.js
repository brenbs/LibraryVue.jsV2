import {http} from './config'

export default{

 list:()=>{
  return http.get('usuarios')
   //aqui entre aspas é meio q a função que to chamando,no caso a de listar(get) usuarios que é como ta la no swagger
  //aqui meio que é a "consulta" a API entao todas as funções do CRUD terão uma dessas 
 },

 save:(usuario)=>{
  return http.post('usuario',usuario)
 },

 update:(usuario)=>{
  return http.put('usuario',usuario)
 },

 delete:(usuario) => {
   return http.delete('usuario',{data:usuario})
 }
}