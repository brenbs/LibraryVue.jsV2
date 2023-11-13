import {http} from './config'

export default{

 list:()=>{
  return http.get('livros')
   //aqui entre aspas é meio q a função que to chamando,no caso a de listar(get) usuarios que é como ta la no swagger
  //aqui meio que é a "consulta" a API entao todas as funções do CRUD terão uma dessas 
 },

 save:(livro)=>{
  return http.post('livro',livro)
 },

 update:(livro)=>{
  return http.put('livro',livro)
 },

 delete:(livro) => {
  return http.delete('livro',{data:livro})
 }
}