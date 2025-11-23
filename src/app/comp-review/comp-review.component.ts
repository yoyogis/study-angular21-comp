import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CityMapComponent } from '@study-angular21-comp/ui-lib';

@Component({
  selector: 'app-comp-review',
  standalone: true,
  imports: [RouterModule, CityMapComponent],
  templateUrl: './comp-review.component.html',
  styleUrl: './comp-review.component.css',
})
export class CompReviewComponent {}
