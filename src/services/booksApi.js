import {http} from './config'

export default{

 list:(params)=>{
  return http.get('book/paged',{
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
  return http.get('book/dash')
 },

 save:(book)=>{
  return http.post('book',book)
 },

 update:(book)=>{
  return http.put(`book/${book.id}`,book)
 },

 delete:(book) => {
  return http.delete(`book/${book.id}`,book)
 }
}