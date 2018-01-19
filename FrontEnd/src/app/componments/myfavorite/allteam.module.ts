import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyfavoriteComponent } from './myfavorite.component';
import { FavoritedetailComponent } from './favoritedetail/favoritedetail.component';
import { RouterModule } from '@angular/router'

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    MyfavoriteComponent,
    FavoritedetailComponent,
  ]
})
export class AllteamModule { }
