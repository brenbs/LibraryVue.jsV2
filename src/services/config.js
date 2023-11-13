import axios from 'axios'

export const http=axios.create({
  //link do método para listar usuários
  baseURL:'https://localhost:7160/api'//aqui é o request URL que ta no swagger,cada método tem o seu 
  
})