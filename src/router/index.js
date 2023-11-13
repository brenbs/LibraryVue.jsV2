import Vue from 'vue';
import VueRouter from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import UsersView from '../views/UsersView.vue';
import EditorsView from '../views/EditorsView.vue';
import RentalView from '../views/RentalView.vue';
import BooksView from '../views/BooksView.vue';

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'DashboardView',
    component: DashboardView
  },
  {
    path: '/Users',
    name: 'UsersView',
    component:UsersView
  },
  {
    path:'/Books',
    name:'BooksView',
    component:BooksView
  },
  {
    path:'/Rental',
    name:'RentalView',
    component:RentalView
  },
  {
    path:'/Editors',
    name:'EditorsView',
    component:EditorsView
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
