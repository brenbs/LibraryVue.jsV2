import {http} from './config'

export default{

 list:(params)=>{
  return http.get('rental/paged',{
    params:{
      SearchValue:params.Searchvalue,
      Page:params.Page,
      PageSize:params.PageSize,
      OrderByProperty:params.OrderByProperty,
      Desc:params.Desc
    }
  })
 },

 dashList:()=>{
  return http.get('rental/dash')
 },

 save:(rental)=>{
  return http.post('rental',rental)
 },

 update:(rental)=>{
  return http.put(`rental/${rental.id}`,rental)
 },

 delete:(rental) => {
  return http.delete(`rental/${rental.id}`,rental)
 }
}