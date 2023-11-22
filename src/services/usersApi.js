import {http} from './config'

export default{

 list:(params)=>{
  return http.get('user/paged',{
    params:{
      SearchValue:params.Searchvalue,
      Page:params.Page,
      PageSize:params.PageSize,
      OrderByPorperty:params.OrderByPorperty,
    }
  })
 },

 save:(user)=>{
  return http.post('user',user)
 },

 update:(user)=>{
  return http.put(`user/${user.id}`,user)
 },

 delete:(user) => {
   return http.delete(`user/${user.id}`,user)
 }
}